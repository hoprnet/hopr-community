// Next.js API route support: https://nextjs.org/docs/api-routes/introduction,



import { joinLobby } from '../../functions/mysql';

export default async function handler(req, res) {
  console.log('API: Join Lobby: ', req.body)
  const mysql =  await joinLobby(JSON.parse(req.body));
  res.status(200).json(mysql)
}
