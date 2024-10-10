"use server";
import type { NextApiRequest, NextApiResponse } from 'next';

interface DidResponse {
  kind: string;
  description: string;
  id: string;
}

interface ResultResponse {
  error?: { description: string };
  message?: string;
  result_url?: string;
}

export async function animate(imageUrls: string, useCredits: any, didAPIKey: any) {
  let options: { method: string; headers: { accept: string; 'content-type': string; authorization: string }; body?: string };
  
  let url = 'https://api.d-id.com/animations';

  options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${useCredits ? didAPIKey : process.env.DID_API_KEY}`
    },
    body: JSON.stringify({
      source_url: imageUrls,
      driver_url: 'bank://nostalgia',
      config: {
        mute: true,
        stitch: true
      }
    })
  };

  const didResponse: DidResponse = await (await fetch(url, options)).json() as DidResponse;
  const { id } = didResponse;

  if (!id) {
    throw new Error("D-ID API Token is invalid or there is a credits issue.");
  }

  url = `https://api.d-id.com/animations/${id}`;
  
  options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Basic ${useCredits ? didAPIKey : process.env.DID_API_KEY}`
    },
  };

  let result: ResultResponse = {};
  let attemptCount = 0;

  while (true) {
    attemptCount++;
    if (attemptCount > 24) {
      console.log("Exceeded maximum retry attempts. Exiting loop.");
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    const response = await fetch(url, options);
    result = await response.json() as ResultResponse;

    if (result.error) {
      return { error: result.error.description };
    }

    if (result.result_url) break;
  }

  return { result_url: result.result_url };
}
