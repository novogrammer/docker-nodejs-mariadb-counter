import express from "express";
import mysql from "mysql2/promise";
import dayjs from "dayjs";


const port=3000;
const dbConfig={
  host:"db",
  user:"user",
  password:"password",
  database:"db",
};

const app=express();


app.get("/", (req, res) => {
  res.send('Hello World!')
});

function getTodayDateString(now){
  return now.format("YYYYMMDD");
}
function getYesterdayDateString(now){
  return now.subtract(1,"d").format("YYYYMMDD");
  
}

async function countUpAsync(connection,date_string){
  const [resultRows/*,fields*/]=await connection.execute("INSERT INTO counters (date_string, count) VALUES(?, 1) ON DUPLICATE KEY UPDATE count=count+1;",[date_string]);
  console.log(resultRows);

}

async function getCountAsync(connection,date_string){
  const [countRows/*,fields*/]=await connection.execute("SELECT count FROM counters WHERE date_string=?",[date_string]);
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


async function getTotalAsync(connection){
  const [totalRows/*,fields*/]=await connection.execute("SELECT SUM(count) as total FROM counters" );
  console.log(totalRows);
  if(totalRows.length!=1){
    throw new Error("totalRows.length must be 1");
  }
  if(!totalRows[0].total){
    throw new Error("total is null");
  }
  const total=Number(totalRows[0].total);
  return total;
}

app.get("/counter",async (req,res)=>{
  const connection = await mysql.createConnection(dbConfig);

  await connection.connect();

  const now=dayjs();
  const todayDateString=getTodayDateString(now);
  const yesterdayDateString=getYesterdayDateString(now);


  // const [rows/*,fields*/]=await connection.execute("select date_string, count from counters" );
  // console.log(rows);

  await countUpAsync(connection,todayDateString);
  
  const total=await getTotalAsync(connection);

  const today=await getCountAsync(connection,todayDateString);
  const yesterday=await getCountAsync(connection,yesterdayDateString);
  const result={
    total,
    today,
    yesterday,
  };
  res.json(result);
});

app.listen(port,()=>{
  console.log(`hello! http://localhost:${port}/`);

})


