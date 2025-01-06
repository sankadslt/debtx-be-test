import { Router } from "express";
import {
    Create_Incident, Upload_DRS_File
} from "../controllers/Incident_controller.js";

const router = Router();

/**
 * @swagger
 * /api/incident/Create_Incident:
 *   post:
 *     summary: INC-1P01 Create a new incident
 *     description: Creates a new incident in the system and generates a task for data extraction from the data lake. Validates the input fields and interacts with external APIs.
 *     tags:
 *       - Incident Management
 *     parameters:
 *       - in: query
 *         name: Account_Num
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 10
 *           example: "1234567890"
 *         description: The account number associated with the incident (max length 10).
 *       - in: query
 *         name: DRC_Action
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["collect arrears", "collect arrears and CPE", "collect CPE"]
 *           example: "collect arrears"
 *         description: The action to be performed for the incident.
 *       - in: query
 *         name: Monitor_Months
 *         required: true
 *         schema:
 *           type: integer
 *           example: 6
 *         description: The number of months to monitor the account.
 *       - in: query
 *         name: Created_By
 *         required: true
 *         schema:
 *           type: string
 *           example: "user123"
 *         description: The username or ID of the person creating the incident.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Account_Num:
 *                 type: string
 *                 description: The account number associated with the incident (max length 10).
 *                 example: "1234567890"
 *               DRC_Action:
 *                 type: string
 *                 description: The action to be performed for the incident.
 *                 enum: ["collect arrears", "collect arrears and CPE", "collect CPE"]
 *                 example: "collect arrears"
 *               Monitor_Months:
 *                 type: integer
 *                 description: The number of months to monitor the account.
 *                 example: 6
 *               Created_By:
 *                 type: string
 *                 description: The username or ID of the person creating the incident.
 *                 example: "user123"
 *     responses:
 *       201:
 *         description: Incident created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Incident created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     Incident_Id:
 *                       type: integer
 *                       description: The unique identifier for the incident.
 *                       example: 101
 *                     Account_Num:
 *                       type: string
 *                       description: The account number associated with the incident.
 *                       example: "1234567890"
 *                     DRC_Action:
 *                       type: string
 *                       description: The action to be performed for the incident.
 *                       example: "collect arrears"
 *                     Monitor_Months:
 *                       type: integer
 *                       description: The number of months to monitor the account.
 *                       example: 6
 *                     Created_By:
 *                       type: string
 *                       description: The username or ID of the person creating the incident.
 *                       example: "user123"
 *                     Created_Dtm:
 *                       type: string
 *                       format: date-time
 *                       description: The date and time the incident was created.
 *                       example: "2025-01-03T12:34:56.789Z"
 *       400:
 *         description: Invalid input or missing fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "All fields are required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Failed to create incident."
 */
router.post("/Create_Incident", Create_Incident);
router.post("/Upload_DRS_File", Upload_DRS_File);




export default router;