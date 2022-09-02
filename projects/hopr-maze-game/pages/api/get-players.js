// Next.js API route support: https://nextjs.org/docs/api-routes/introduction,



import { getPlayers } from '../../functions/mysql';

export default async function handler(req, res) {
  console.log('API: start-game: ', req.body)
  const mysql =  await getPlayers(JSON.parse(req.body));
 // console.log('mysql: ', mysql)
  res.status(200).json(mysql)
}
