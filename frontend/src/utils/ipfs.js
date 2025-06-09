export async function uploadImageToIPFS(file) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  let data = new FormData();
  data.append('file', file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
        'pinata_api_key': '777254552db4c2dba60d',
        'pinata_secret_api_key': '1c865b5a987ae2c06848446a2461afd98e9d942eb3141f1931022db966adfa19',
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error("Gagal upload gambar ke IPFS");
  }

  const result = await response.json();

  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}
