import mongoose from "mongoose";

const taskListSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: true }
);

const TaskList = mongoose.model("TaskList", taskListSchema);

export default TaskList;
