const mysql = require('serverless-mysql');
const escape = require('sql-template-strings')


// CREATE TABLE `maze_lobbies` (
//   `id` BIGINT NOT NULL UNIQUE AUTO_INCREMENT, 
//   `open` BOOLEAN NOT NULL DEFAULT true, 
//   `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
//   PRIMARY KEY (id)
// ) 
// ENGINE = InnoDB;

// CREATE TABLE `maze_players` (
//   `peerId` varchar(200) UNIQUE, 
//   `lobbyId` BIGINT NOT NULL DEFAULT true, 
//   `enviorement` varchar(200), 
//    `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//    UNIQUE KEY (peerId, enviorement),
//    PRIMARY KEY (peerId),
//    FOREIGN KEY (lobbyId) REFERENCES maze_lobbies(id)
//   ) 

const db = mysql({
  config: {
    host     : process.env.MYSQL_HOST,
    database : process.env.MYSQL_DATABASE_NAME,
    user     : process.env.MYSQL_USERNAME,
    password : process.env.MYSQL_PASSWORD
  }
})

const queryDB = async (query) => {
  let results = await db.query(query);
  await db.end();
  return results
}

const queryDBTransaction = async (query1, query2, query3, query4) => {
  try {
    let results;
    if (query4) {
      results = await db.transaction()
      .query(query1)
      .query(query2)
      .query(query3)
      .query(query4)
      .commit() // execute the queries
    } else if (query3) {
      results = await db.transaction()
      .query(query1)
      .query(query2)
      .query(query3)
      .commit() // execute the queries
    } else {
      results = await db.transaction()
      .query(query1)
      .query(query2)
      .commit() // execute the queries
    }
 //   let results = await db.transaction()
 //   console.log(arguments)
  //  arguments.map(query => {db.query(query)});
  //  db.commit();
    await db.end();
    return results;
  } catch (error) {
    throw error
  }
}

// export async function insertIpToScoreboard (ip, country) {
//     console.log('MySQL: insertIp', ip);
//     await queryDB(escape`
//       INSERT INTO ips (ip, country, count) VALUES (${ip},${country},1)
//       ON DUPLICATE KEY UPDATE count = count + 1;
//     `)
// }

export async function getLobbies (payload) {
  console.log('MySQL: getLobbies');
  const { environment } = payload;
  let query1 = await queryDB(escape`
    SELECT *, UNIX_TIMESTAMP(startsAt)-UNIX_TIMESTAMP(NOW()) AS startsAtSec
    FROM maze_lobbies
    WHERE maze_lobbies.timestamp >= (NOW() - INTERVAL 12 HOUR) AND enviorement = ${environment}
  `);
  let query2 = await queryDB(escape`
    SELECT lobbyId, COUNT(lobbyId) AS count FROM maze_players 
    WHERE timestamp >= (NOW() - INTERVAL 12 HOUR)
    GROUP BY lobbyId;
  `);
  let combined = query1.map ( lobby=>{
    return {
      ...lobby,
      players:  query2.filter(elem => elem.lobbyId === lobby.id)[0]?.count || 0
    }}
  )
  return combined;
}


export async function createLobby2 (payload) {
  const { peerId, environment } = payload;
  let results = await db.transaction()
    .query('DELETE FROM maze_players WHERE peerId=? AND enviorement = ?', [peerId, environment])
    .query('INSERT INTO maze_lobbies (open, enviorement) VALUE (1, ?)', [environment])
    .query((r) => ['INSERT INTO maze_players (peerId, lobbyId, enviorement) VALUE (?, ?, ?)', [peerId, r.insertId, environment]])
    .commit()
    console.log(results);
  return {lobbyId: results[1].insertId}//{insertId: query.insertId};
}

export async function joinLobby (payload) {
  const { peerId, environment, lobbyId } = payload;
  let query = await queryDB(escape`
    INSERT INTO maze_players (peerId, lobbyId, enviorement) VALUE (${peerId}, ${lobbyId}, ${environment}) ON DUPLICATE KEY UPDATE timestamp=NOW(), lobbyId=${lobbyId} ;
  `);
  return query
}

export async function startGame (payload) {
  console.log('MySQL: startGame');
  const { peerId, environment, lobbyId } = payload;
  let map = Math.random();
  let results = await db.transaction()
  .query('UPDATE maze_lobbies SET open = 0, map = ?, startsAt = (NOW() + INTERVAL 11 SECOND) WHERE id = ? AND enviorement = ?', [map, lobbyId, environment])
  .query('SELECT peerId FROM maze_players WHERE lobbyId = ? AND enviorement = ? ORDER BY peerId ASC', [lobbyId, environment])
  .query(`SELECT 
          UNIX_TIMESTAMP(startsAt)-(UNIX_TIMESTAMP(NOW())) AS startsAtSec,
          map 
          FROM maze_lobbies WHERE id = ? AND enviorement = ?`, [lobbyId, environment])
  .commit()
  return {
    peers: results[1],
    game: results[2]
  };
}

export async function getPlayers (payload) {
  console.log('MySQL: getPlayers');
  const { environment, lobbyId } = payload;
  let query = await queryDB(escape`
    SELECT peerId FROM maze_players WHERE lobbyId = ${lobbyId} AND enviorement = ${environment} ORDER BY peerId ASC;
  `);
  return query;
}

