const amqp = require("amqplib");

let connection, channel;
let queue_name="task_created";
async function start() {
    try {
      connection = await amqp.connect("amqp://rabbitmq");
      channel = await connection.createChannel();
      await channel.assertQueue(queue_name);
      console.log("Connected to rabbit mq");
      console.log("Notification service is listening to messages");
      channel.consume(queue_name, (msg)=>{
        const task_data = JSON.parse(msg.content.toString());
        console.log('Notification: NEW TASK: ', task_data.title);
        console.log('TASK: ', task_data);
        channel.ack(msg);
        
      })
    } catch (err) {
        console.log("Error in rabbit mq connection : ",err.message);
    }
}

start();