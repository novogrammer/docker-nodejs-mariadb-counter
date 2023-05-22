import express from "express";
import mysql from "mysql2/promise";


const port=3000;
const dbConfig={
  host:"db",
  user:"user",
  password:"password",
  database:"db",
};

const counterName="myCounterName";

const app=express();


app.get("/", (req, res) => {
  res.send('Hello World!')
});


async function countUpAsync(connection){
  const [resultRows/*,fields*/]=await connection.execute("INSERT INTO counters (counter_name, count) VALUES(?, 1) ON DUPLICATE KEY UPDATE count=count+1;",[counterName]);
  console.log(resultRows);

}

async function getCountAsync(connection){
  const [countRows/*,fields*/]=await connection.execute("SELECT count FROM counters WHERE counter_name=?",[counterName]);
  console.log(countRows);
  let count=0;
  if(countRows.length==0){
    // DO NOTHING
  }else if(countRows.length==1){
    if(!countRows[0].count){
      throw new Error("count is null");
    }
    count=Number(countRows[0].count);
  }else{
    throw new Error("countRows.length must be 0 or 1");
  }
  return count;
}

app.get("/counter",async (req,res)=>{
  const connection = await mysql.createConnection(dbConfig);

  await connection.connect();


  await countUpAsync(connection);
  const count=await getCountAsync(connection);
  const result={
    count,
  };
  res.json(result);
});

app.listen(port,()=>{
  console.log(`hello! http://localhost:${port}/`);

})


