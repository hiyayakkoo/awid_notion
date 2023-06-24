require('dotenv').config()
const { Client, LogLevel } = require("@notionhq/client");
const schedule = require('node-schedule');

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
    const titles = ["Title 1", "Title 2", "Title 3"];
    const images = [
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg",
        "https://t4.ftcdn.net/jpg/05/09/39/87/360_F_509398736_P1S7GpzyCzp8nrj4kKrPlcKora6VJk6b.jpg"];
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

