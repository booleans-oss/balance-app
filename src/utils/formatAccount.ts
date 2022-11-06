export default function formatAccount(num: number | string) {
  let currentNum = typeof num === 'string' ? Number(num) : num;
  while (currentNum % 10 === 0 && currentNum > 10) {
    currentNum = currentNum / 10
  }

  return currentNum
}
