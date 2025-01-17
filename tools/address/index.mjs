import 'dotenv/config'
import { mkdir, writeFileSync, createReadStream, constants } from 'node:fs'
import { access } from 'node:fs/promises'
import readline from 'readline'
import { join } from 'path'

async function ensureExists (path) {
  await mkdir(path, 0o744, function (err) {
    if (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
    }
  })
}

async function processPostcode (postcode) {
  const part1 = postcode.split(' ')[0]
  const outputFile = join('./output/', part1, postcode + '.json')
  try {
    await access(outputFile, constants.F_OK)
    return false
  } catch {
    await ensureExists(join('./output/', part1))
    const uri = `${osPostcodeUrl}lr=EN&fq=logical_status_code:1&postcode=${postcode}&key=${osSearchKey}&dataset=DPA&&maxresults=1`
    const response = await fetch(uri)
    const jsonData = await response.json()
    writeFileSync(outputFile, JSON.stringify(jsonData))
    return true
  }
}

function delay (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

const fileName = process.argv[2]
const osPostcodeUrl = process.env.OS_POSTCODE_URL
const osSearchKey = process.env.OS_SEARCH_KEY

if (!osPostcodeUrl) {
  throw new Error('no OS_POSTCODE_URL defined')
}

await ensureExists('./output')

const fileStream = createReadStream(fileName)

const rl = readline.createInterface({
  input: fileStream
})

let count = 0

for await (const line of rl) {
  if (await processPostcode(line)) {
    await delay(250)
  }
  count++
  console.log('.')
  if (count % 10 === 0) {
    console.log(count)
  }
}
