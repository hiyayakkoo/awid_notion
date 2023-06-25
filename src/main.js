require('dotenv').config()
const { Client, LogLevel } = require("@notionhq/client");
const schedule = require('node-schedule');

const Web3 = require('web3').default;

const web3 = new Web3('https://sepolia.infura.io/v3/'); // Sepoliaのエンドポイントに変更

const contractAddress = '0x9020144c4E1E7Ff3De45dD65DF8d07EC6849DA99';

// スマートコントラクトのABIを設定
const abi = [
    {
        constant: true,
        inputs: [],
        name: 'getLogicList',
        outputs: [{name: '', type: 'string[]'}],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
];

const contract = new web3.eth.Contract(abi, contractAddress);

async function getLogicList() {
    try {
        const result = await contract.methods.getLogicList().call();
        console.log(result);
        return result;
    } catch (error) {
        console.error(error);
    }
}

getLogicList()

// Notion APIのクライアントを初期化
const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  logLevel: LogLevel.DEBUG,
});

// NotionのデータベースIDをセット
const databaseId = process.env.NOTION_DATABASE_ID;

// 一定期間ごとに実行するジョブをセット
// この例では、毎分0秒に実行します
schedule.scheduleJob('* * * * *', async function() {
    console.log(await getLogicList())
    const titles = await getLogicList()
    console.log(titles)
  
  // 全てのページを取得
  const response = await notion.databases.query({ database_id: databaseId });
  const pages = response.results;

  // 配列の長さ以上のページを削除
  for (let i = titles.length; i < pages.length; i++) {
    await notion.pages.update({
      page_id: pages[i].id,
      archived: true
    });
  }

  for (let i = 0; i < titles.length; i++) {
    if (i < pages.length) {
      // 既存のページを更新
      await notion.pages.update({
        page_id: pages[i].id,
        properties: {
          'title': {
            title: [
              {
                text: {
                  content: titles[i],
                },
              },
            ],
          },
          'address': {
            rich_text: [
              {
                text: {
                  content: "",
                },
              },
            ],
          },
        },
      });
    } else {
      // 新しいページを作成
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          'title': {
            title: [
              {
                text: {
                  content: titles[i],
                },
              },
            ],
          },
          'address': {
            rich_text: [
              {
                text: {
                  content: "",
                },
              },
            ],
          },
        },
      });
    }
  }
});

