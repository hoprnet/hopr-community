// Next.js API route support: https://nextjs.org/docs/api-routes/introduction,



import { getLobbies } from '../../functions/mysql';

export default async function handler(req, res) {
  console.log('API: getLobbies')
  const mysql = await getLobbies(JSON.parse(req.body));
  res.status(200).json(mysql);
}
