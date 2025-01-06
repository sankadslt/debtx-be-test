import moment from "moment";
import db from "../config/db.js";
import mongoose from "mongoose";
import Incident_log from "../models/Incident_log.js";
import Task from "../models/Task.js";
import FileUploadLog from "../models/file_upload_log.js";
import fs from "fs";
import path from "path";
import { Request_Incident_External_information } from "../services/IncidentService.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const Create_Incident = async (req, res) => {
  const { Account_Num, DRC_Action, Monitor_Months, Created_By } = req.body;

  try {
    // Validate required fields
    if (!Account_Num || !DRC_Action || !Monitor_Months || !Created_By) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    // Validate Account_Num length
    if (Account_Num.length > 10) {
      return res.status(400).json({
        status: "error",
        message: "Account number must be 10 characters or fewer.",
      });
    }
    // Validate Actions against enum values
    const validActions = ["collect arrears", "collect arrears and CPE", "collect CPE"];
    if (!validActions.includes(DRC_Action)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid action. Allowed values are: ${validActions.join(", ")}.`,
      });
    }

    // // Check if an active case exists for the Account_Num
    // const activeCase = await Incident_log.findOne({
    //   Account_Num,
    //   Actions: "Active", // Assuming this checks for active cases
    // });

    // if (activeCase) {
    //   return res.status(400).json({
    //     status: "error",
    //     message: "An active case already exists for the provided account number.",
    //   });
    // }

    // Generate a new Incident_Id
    const mongoConnection = await mongoose.connection;
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "incident_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Incident_Id = counterResult.seq;

    // Insert values into Incident_log
    const newIncident = new Incident_log({
      Incident_Id,
      Account_Num,
      Actions: DRC_Action,
      Monitor_Months, // Add Monitor_Months
      Created_By,
      Created_Dtm: moment().toDate(),
    });

    await newIncident.save();

    // Call external API: Request_Incident_External_information
    try {
      await Request_Incident_External_information({ Account_Num, Monitor_Months });
    } catch (apiError) {
      console.error("Error calling external API:", apiError.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to request external incident information.",
      });
    }

    // Create task: "Extract data from data lake" (Template_Task_Id: 9)
    const mongo = await db.connectMongoDB();
    const TaskCounter = await mongo.collection("counters").findOneAndUpdate(
      { _id: "task_id" }, // Counter ID for task generation
      { $inc: { seq: 1 } }, // Increment the sequence
      { returnDocument: "after", upsert: true }
    );

    const Task_Id = TaskCounter.seq; // Get the generated Task_Id

    const taskData = {
      Task_Id, // Unique Task_Id
      Template_Task_Id: 9, // ID for "Extract data from data lake"
      parameters: {
        Incident_Id: Incident_Id.toString(), // Store values as strings for Map type
        Account_Num: Account_Num,
      },
      Created_By, // The user who initiated the task
      Execute_By: "SYS", // Default to null
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      Task_Id_Error: null,
      created_dtm: new Date(), // Current timestamp
      end_dtm: null, // Default to null
    };

    // Insert task into the database
    await Task.create(taskData);

    return res.status(201).json({
      status: "success",
      message: "Incident created successfully.",
      data: {
        Incident_Id,
        Account_Num,
        DRC_Action,
        Monitor_Months, // Include in the response
        Created_By,
        Created_Dtm: newIncident.Created_Dtm,
      },
    });
  } catch (error) {
    console.error("Unexpected error during incident creation:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to create incident.",
      errors: {
        exception: error.message,
      },
    });
  }
};





export const Upload_DRS_File = async (req, res) => {
  const { File_Name, File_Type, File_Content, Created_By } = req.body;

  try {
    // Validate required fields
    if (!File_Name || !File_Type || !File_Content || !Created_By) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required.",
      });
    }

    // Validate File_Type against allowed values
    const validFileTypes = [
      "Incident Creation",
      "Incident Reject",
      "Distribute to DRC",
      "Validity Period Extend",
      "Hold",
      "Discard",
    ];

    if (!validFileTypes.includes(File_Type)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid File Type. Allowed values are: ${validFileTypes.join(", ")}.`,
      });
    }

    // Generate a unique File_Id
    const mongoConnection = await db.connectMongoDB();
    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "file_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const File_Id = counterResult.seq;
    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }


    // Upload file to the server
    const uploadPath = path.join(__dirname, "../uploads", File_Name);
    fs.writeFileSync(uploadPath, File_Content, "utf8");

    // Insert into file_upload_log table
    const newFileLog = new FileUploadLog({
      File_Id,
      File_Name,
      File_Type,
      Uploaded_By: Created_By,
      Uploaded_Dtm: moment().toDate(),
      File_Path: uploadPath,
    });

    await newFileLog.save();

    // Create Task: "Extract Incident from File" (Template_Task_Id: 1)
    const taskCounter = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "task_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const Task_Id = taskCounter.seq;

    const taskData = {
      Task_Id,
      Template_Task_Id: 1,
      parameters: {
        File_Id: File_Id.toString(),
        File_Name,
        File_Type,
      },
      Created_By,
      Execute_By: null,
      Sys_Alert_ID: null,
      Interaction_ID_Success: null,
      Interaction_ID_Error: null,
      Task_Id_Error: null,
      created_dtm: new Date(),
      end_dtm: null,
      status: "pending",
      status_changed_dtm: null,
      status_description: "",
    };

    // Insert task into the System_tasks table
    await Task.create(taskData);

    return res.status(201).json({
      status: "success",
      message: "File uploaded successfully, and task created.",
      data: {
        File_Id,
        Task_Id,
        File_Name,
        File_Type,
        Created_By,
        Uploaded_Dtm: newFileLog.Uploaded_Dtm,
      },
    });
  } catch (error) {
    console.error("Error during file upload and task creation:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload file and create task.",
      errors: {
        exception: error.message,
      },
    });
  }
};

