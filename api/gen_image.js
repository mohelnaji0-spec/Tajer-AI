export default async function handler(req, res) {  
  res.setHeader('Access-Control-Allow-Origin', '*');  
  const {prompt} = req.body;  
  const image = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;  
  return res.status(200).json({image});  
}  
