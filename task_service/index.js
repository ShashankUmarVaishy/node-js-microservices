const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const app = express();
const PORT = 3002;

app.use(bodyParser.json());
mongoose
  .connect("mongodb://mongo:27017/tasks")
  .then(() => console.log("Task service connected to mongodb"))
  .catch((err) =>
    console.error("MongoDB connection error in task_Service : ", err)
  );

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", TaskSchema);

let channel, connection;

async function connectRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries) {
    try {
      connection = await amqp.connect("amqp://rabbitmq");
      channel = await connection.createChannel();
      await channel.assertQueue("task_created");
      console.log("Connected to rabbit mq");
      return;
    } catch (err) {
        console.log("Error in rabbit mq connection : ",err);
        retries--;
        console.log("Retries in 3s : ",retries);
        await new Promise(res=> setTimeout(res, delay));
    }
  }
}

app.get("/", async (req, res) => {
  res.send("Hello, welcome to task_service");
});
app.get("/task", async (req, res) => {
  const tasks = await Task.find();
  res.status(200).json(tasks);
});
app.post("/task", async (req, res) => {
  const { title, description, userId } = req.body;
  try {
    const task = new Task({ title, description, userId });
    await task.save();

    const message = { taskId: task._id, userId, title };
    if(!channel){
        return res.status(503).json({error: "Task created but rabbitMQ not connected "})
    }

    channel.sendToQueue("task_created", Buffer.from(
        JSON.stringify(message)
    ))

    res.status(200).json(task);
  } catch (err) {
    console.error("task error : ", err);
    res.status(500).json({ error: "Internal Server Error" + err });
  }
});
app.listen(PORT, ()=>{
    console.log("Task_Service running on port ", PORT);
    connectRabbitMQWithRetry();
});
