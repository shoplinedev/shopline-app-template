import fetch from 'node-fetch'

const API_VERSION = 'v20230901'

const TITLE = [
  'cloth',
  'book',
  'tea',
  'water'
]

export default async function createProduct(
  handle,
  token,
  headers = {}
) {
  try {
    const url = `https://${handle}.myshopline.com/admin/openapi/${API_VERSION}/products/products.json`
    const bodyParams = {
      "product": {
        "title": `${randomTitle()}`,
        "variants": [{ price: `${randomPrice()}` }],
      }
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        "User-Agent": headers['user-agent'],
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyParams)
    })
    if (!/2[0-9]+/.test(`${response.status}`)) {
      throw new Error(response.statusText)
    }
    const data = await response.json()
    return {
      headers: response.headers,
      data,
    }
  } catch (error) {
    throw error;
  }
}

function randomTitle() {
  const title = TITLE[Math.floor(Math.random() * TITLE.length)];
  return `${title}`;
}


function randomPrice() {
  return Math.round((Math.random() * 10 + Number.EPSILON) * 100) / 100;
}
