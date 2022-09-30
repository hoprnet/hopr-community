// Next.js API route support: https://nextjs.org/docs/api-routes/introduction,



import { createLobby, createLobby2 } from '../../functions/mysql';

export default async function handler(req, res) {
  console.log('API: Create Lobby: ', req.body)
  const mysql =  await createLobby2(JSON.parse(req.body));
  res.status(200).json(mysql)
}
