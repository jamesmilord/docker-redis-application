const axios = require("axios");
const bluebird = require("bluebird");
const redis = require("redis");
bluebird.promisifyAll(redis);
const client = redis.createClient("redis://redis:6379");

client.on("connect", function() {
  console.log("Redis client connected");
});

async function main() {
  const checkSum = await getCheckSum();
  axios
    .get(`http://answer:3000/${checkSum}`)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
}

async function getCheckSum() {
  const keys = await client.keysAsync("*");
  let sumDifferences = 0;

  for (let key of keys) {
    let type = await client.typeAsync(key);
    let list =
      type === "list"
        ? await client.lrangeAsync(key, 0, -1)
        : await client.smembersAsync(key);
    let sortedList =
      type === "list"
        ? list.sort((a, b) => Number(a) - Number(b)) //normal array sort
        : [...list].sort((a, b) => Number(a) - Number(b)); // convert set to array then sort
    let foundAnagram = findAnagram(sortedList); //return boolean
    let foundDivisibleByTarget = canBeDividedToTarget(sortedList); //return boolean
    if (!foundAnagram && !foundDivisibleByTarget) {
      sumDifferences +=
        Number(sortedList[sortedList.length - 1]) - Number(sortedList[0]);
    }
  }
  return sumDifferences;
}

function findAnagram(list) {
  const anagramSet = new Set();
  for (let i in list) {
    let val = list[i]
      .split("")
      .sort()
      .join();
    if (anagramSet.has(val)) {
      return true;
    } else {
      anagramSet.add(val);
    }
  }
  return false;
}

function canBeDividedToTarget(list) {
  const dividedSet = new Set();
  for (let i in list) {
    if (Number(list[i]) % 177 == 0 && dividedSet.has(Number(list[i]) / 177)) {
      return true;
    } else {
      dividedSet.add(Number(list[i]));
    }
  }
  return false;
}

main();
