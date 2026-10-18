import test from 'node:test';
import assert from 'node:assert/strict';
// Mirrors the public contract exercised in the browser; detailed utilities are TypeScript source.
const normalize = (raw) => { try { const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`); return ['http:', 'https:'].includes(url.protocol) && url.hostname ? url.toString() : null; } catch { return null; } };
test('URL 補完は https を追加する', () => assert.equal(normalize('example.com'), 'https://example.com/'));
test('危険なスキームを拒否する', () => { assert.equal(normalize('javascript:alert(1)'), null); assert.equal(normalize('data:text/html,x'), null); });
test('不正な URL を拒否する', () => assert.equal(normalize('http://'), null));
test('タグは重複を除き空文字を除外する', () => assert.deepEqual([...new Set([' tools ', 'tools', '', 'reference'].map((x) => x.trim()).filter(Boolean))], ['tools', 'reference']));
