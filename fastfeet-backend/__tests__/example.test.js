function soma(a, b) {
  return a + b;
}

test('should return 9 when receive 4 and 5', () => {
  const result = soma(4, 5);

  expect(result).toBe(9);
});
