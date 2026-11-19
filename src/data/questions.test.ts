import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_QUESTIONS } from './questions';

test('quiz bank contains exactly 60 unique questions', () => {
  assert.equal(QUIZ_QUESTIONS.length, 60);
  const ids = new Set(QUIZ_QUESTIONS.map((q) => q.id));
  assert.equal(ids.size, 60);
});

test('quiz bank balances difficulties (20 Mudah, 20 Sedang, 20 Sulit)', () => {
  const counts = { Mudah: 0, Sedang: 0, Sulit: 0 };
  for (const q of QUIZ_QUESTIONS) {
    counts[q.kesulitan] += 1;
  }
  assert.equal(counts.Mudah, 20);
  assert.equal(counts.Sedang, 20);
  assert.equal(counts.Sulit, 20);
});

test('quiz bank covers Pantun, Syair, and Gurindam evenly', () => {
  const topics = { Pantun: 0, Syair: 0, Gurindam: 0 };
  for (const q of QUIZ_QUESTIONS) {
    topics[q.materi] += 1;
  }
  assert.ok(topics.Pantun >= 18, `Expected >= 18 Pantun, got ${topics.Pantun}`);
  assert.ok(topics.Syair >= 18, `Expected >= 18 Syair, got ${topics.Syair}`);
  assert.ok(topics.Gurindam >= 18, `Expected >= 18 Gurindam, got ${topics.Gurindam}`);
});

test('every question has 4 non-empty options, valid answer index, and explanation', () => {
  for (const q of QUIZ_QUESTIONS) {
    assert.equal(q.pilihan.length, 4, `Question ${q.id} should have 4 options`);
    for (const opt of q.pilihan) {
      assert.ok(opt.trim().length > 0, `Question ${q.id} has empty option`);
    }
    assert.ok(q.jawabanIndex >= 0 && q.jawabanIndex <= 3, `Question ${q.id} invalid answer index`);
    assert.ok(q.pertanyaan.trim().length > 5, `Question ${q.id} question text too short`);
    assert.ok(q.pembahasan.trim().length > 10, `Question ${q.id} explanation too short`);
  }
});
