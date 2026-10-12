import assert from 'node:assert/strict';
import { HISTORICAL_CASES, SYNTHETIC_EVENTS, createDemoRecords, getDatasetSummary } from '../src/fixtures.js';
import { applyMockReview, buildSyntheticReport, deriveBaseline, normalizeParameters, simulateComparison, simulateOnce, syntheticHoldout } from '../src/simulation.js';

const tests = [];
function test(name, run) { run(); tests.push(name); console.log(`PASS ${name}`); }

test('40-case synthetic source has unique, chronological events and no release on blocked or rejected histories', () => {
  assert.equal(HISTORICAL_CASES.length, 40);
  assert.equal(new Set(HISTORICAL_CASES.map(record => record.id)).size, 40);
  assert.equal(new Set(SYNTHETIC_EVENTS.map(event => event.event_id)).size, SYNTHETIC_EVENTS.length);
  for (const record of HISTORICAL_CASES) {
    for (let i = 1; i < record.events.length; i++) assert.ok(Date.parse(record.events[i].timestamp) >= Date.parse(record.events[i - 1].timestamp));
    assert.ok(record.events.every(event => event.case_id === record.id && event.source_ref === record.sourceRef));
    if (record.status === 'blocked' || record.status === 'rejected') assert.equal(record.events.some(event => event.activity === 'Invoice issued'), false);
    if (record.status === 'completed') assert.ok(record.events.some(event => event.activity === 'Human review approved'));
  }
  assert.equal(getDatasetSummary().completed, 24);
  assert.equal(deriveBaseline().completedCases, 24);
  assert.throws(() => deriveBaseline([]), /baseline needs/);
});

test('same seed is reproducible and every route uses exactly the same arrivals and downstream draws', () => {
  const first = simulateComparison({ runs: 40 });
  assert.deepEqual(first, simulateComparison({ runs: 40 }));
  const human = simulateOnce({}, 'human');
  const agent = simulateOnce({}, 'agent');
  assert.deepEqual(human.trace.map(job => job.arrival), agent.trace.map(job => job.arrival));
  assert.deepEqual(human.trace.map(job => job.invoiceDelay), agent.trace.map(job => job.invoiceDelay));
  assert.deepEqual(human.trace.map(job => job.cashDelay), agent.trace.map(job => job.cashDelay));
  assert.notDeepEqual(simulateComparison({ seed: 9876, runs: 40 }), first);
});

test('exception pressure and slower agent handling worsen modeled queues rather than imply guaranteed improvement', () => {
  const low = simulateComparison({ exceptionRate: 0, runs: 60 }).agent;
  const high = simulateComparison({ exceptionRate: 0.8, runs: 60 }).agent;
  assert.ok(high.exceptionCases.mean > low.exceptionCases.mean);
  assert.ok(high.exceptionQueueHours.mean > low.exceptionQueueHours.mean);
  assert.ok(high.cycleDays.mean > low.cycleDays.mean);
  assert.ok(high.completedCases.mean < low.completedCases.mean);
  assert.equal(high.bottleneck, 'Exceptions');
  const slow = simulateComparison({ agentHandlingMinutes: 180, runs: 60 }).agent;
  assert.ok(slow.triageQueueHours.mean > low.triageQueueHours.mean);
  assert.equal(slow.bottleneck, 'Triage');
  assert.ok(slow.cycleDays.mean > low.cycleDays.mean);
});

test('supplemental review never disables the compulsory approval gate, even at extremes', () => {
  for (const supplementalReviewRate of [0, 1]) {
    const run = simulateOnce({ supplementalReviewRate, exceptionRate: 0.8, agentHandlingMinutes: 180 });
    assert.equal(run.humanApprovals, 40);
    assert.equal(run.releasesWithoutApproval, 0);
    for (const job of run.trace) {
      assert.equal(job.humanApproved, true);
      assert.ok(job.invoiceIssued > job.reviewDone);
      assert.ok(job.completed >= job.invoiceIssued);
      assert.ok(job.reviewWait >= 0 && job.exceptionWait >= 0 && job.triageWait >= 0);
    }
  }
  const fullAudit = simulateComparison({ supplementalReviewRate: 1, runs: 40 }).agent;
  const noExtraAudit = simulateComparison({ supplementalReviewRate: 0, runs: 40 }).agent;
  assert.ok(fullAudit.reviewQueueHours.mean > noExtraAudit.reviewQueueHours.mean);
});

test('all intervals are finite and ordered and invalid parameters cannot break the model', () => {
  const normalized = normalizeParameters({ seed: NaN, runs: NaN, cases: Infinity, exceptionRate: -1, agentHandlingMinutes: 800, supplementalReviewRate: 900 });
  assert.equal(normalized.cases, 40);
  assert.equal(normalized.runs, 120);
  assert.equal(normalized.exceptionRate, 0);
  assert.equal(normalized.agentHandlingMinutes, 180);
  assert.equal(normalized.supplementalReviewRate, 1);
  for (const route of Object.values(simulateComparison({ runs: 20 })).filter(value => value?.cycleDays)) {
    for (const [metric, range] of Object.entries(route)) {
      if (metric === 'bottleneck') continue;
      assert.ok(Number.isFinite(range.mean) && Number.isFinite(range.low) && Number.isFinite(range.high));
      assert.ok(range.low <= range.high);
    }
  }
});

test('staged records include every required state, block unsafe mock approval and reset without mutation', () => {
  const original = createDemoRecords();
  assert.equal(original.length, 10);
  assert.deepEqual(new Set(original.map(record => record.status)), new Set(['pending', 'blocked', 'completed', 'rejected']));
  const blocked = original.find(record => record.status === 'blocked');
  assert.deepEqual(applyMockReview(original, blocked.id, 'approve'), original);
  const approved = applyMockReview(original, 'O-248', 'approve');
  assert.equal(approved.find(record => record.id === 'O-248').mockReview, 'approve');
  assert.equal(original.find(record => record.id === 'O-248').mockReview, undefined);
  assert.equal(approved.find(record => record.id === 'O-248').events.some(event => event.activity === 'Invoice issued'), false);
  assert.deepEqual(createDemoRecords(), original);
  assert.deepEqual(applyMockReview(approved, 'O-248', 'approve'), approved);
});

test('holdout and exported report preserve synthetic evidence boundaries', () => {
  const holdout = syntheticHoldout();
  assert.equal(holdout.customerHoldoutStatus, 'Not assessed');
  assert.equal(holdout.incumbentComparisonStatus, 'Not run');
  assert.equal(holdout.naiveEffect, 0);
  const report = buildSyntheticReport(simulateComparison({ runs: 20 }), createDemoRecords(), holdout);
  assert.match(report.watermark, /DEMO.*SYNTHETIC/);
  assert.equal(report.model.validatedOnCustomerData, false);
  assert.ok(report.model.assumptions.length >= 7);
  assert.match(report.notice, /No customer accuracy/);
});

console.log(`\n${tests.length} meaningful fixture, simulation, control and report checks passed.`);
