const humidity = { value: 80, unit: '%' }
const temperature = { value: 30, unit: 'C' }

// Read from file
let jsonStr = `{
  custom_humidity: {...humidity},
  custom_temperature: {...temperature, humidity}
}`

// dataList
const obj = { humidity, temperature }
let executeStr = `const obj = ${JSON.stringify(obj)}\n`

Object.keys(obj).forEach(key => {
  executeStr += `const ${key} = obj.${key}\n`
})

executeStr += `const data = ${jsonStr}\n` + 'return data'

try {
  const getCustomJson = new Function(executeStr)
  console.log(getCustomJson(-1))
} catch (err) {
  console.log(err.message)
}