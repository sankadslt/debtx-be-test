/* 
    Purpose: This template is used for the DRC Controllers.
    Created Date: 2024-11-21
    Created By: Janendra Chamodi (apjanendra@gmail.com)
    Last Modified Date: 2024-11-24
    Modified By: Janendra Chamodi (apjanendra@gmail.com)
                Naduni Rabel (rabelnaduni2000@gmail.com)
                Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Version: Node.js v20.11.1
    Dependencies: mysql2
    Related Files: DRC_route.js
    Notes:  
*/



// import db from "../config/db.js";
import db from "../config/db.js";
import DRC from "../models/Debt_recovery_company.js";

import moment from "moment"; // Import moment.js for date formatting

// Function to register a new Debt Recovery Company (DRC)
export const registerDRC = async (req, res) => {
  const { DRC_Name, DRC_Abbreviation, Contact_Number } = req.body;

  try {
    // Validate required fields
    if (!DRC_Name || !DRC_Abbreviation || !Contact_Number) {
      return res.status(400).json({
        status: "error",
        message: "Failed to register DRC.",
        errors: {
          field_name: "All fields are required",
        },
      });
    }

    // Default values
    const drcStatus = "Active"; // Default to Active status
    const drcEndDate = ""; // Default end date is null
    const createdBy = "Admin"; // Default creator
    const create_dtm = moment().format("YYYY-MM-DD HH:mm:ss"); // Format date for SQL-like format

    // Connect to MongoDB
    const mongoConnection = await db.connectMongoDB();
    if (!mongoConnection) {
      throw new Error("MongoDB connection failed");
    }

    const counterResult = await mongoConnection.collection("counters").findOneAndUpdate(
      { _id: "drc_id" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    console.log("Counter Result:", counterResult);

    // Correctly extract the sequence ID from the top-level structure
    if (!counterResult || !counterResult.seq) {
      throw new Error("Failed to generate drc_id");
    }

    const drc_id = counterResult.seq;

    // Save data to MongoDB
    const newDRC = new DRC({
      drc_id,
      drc_abbreviation: DRC_Abbreviation,
      drc_name: DRC_Name,
      drc_status: drcStatus,
      teli_no: Contact_Number,
      drc_end_dat: drcEndDate,
      create_by: createdBy,
      create_dtm: moment(create_dtm, "YYYY-MM-DD HH:mm:ss").toDate(), // Save the formatted date here
      services_of_drc: [], // Initialize with an empty array of services
    });

    await newDRC.save();

    // // Save data to MySQL
    // const insertDRCQuery = `
    //   INSERT INTO debt_recovery_company (
    //     drc_id,
    //     drc_name,
    //     drc_abbreviation,
    //     contact_number,
    //     drc_status,
    //     drc_end_dat,
    //     create_by,
    //     create_dtm
    //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    // `;

    // const valuesForQuery = [
    //   drc_id,
    //   DRC_Name,
    //   DRC_Abbreviation,
    //   Contact_Number,
    //   drcStatus,
    //   drcEndDate,
    //   createdBy,
    //   create_dtm, // Save the formatted date here
    // ];

    // await new Promise((resolve, reject) => {
    //   db.mysqlConnection.query(insertDRCQuery, valuesForQuery, (err, result) => {
    //     if (err) {
    //       console.error("Error inserting DRC into MySQL:", err);
    //       reject(err);
    //     } else {
    //       resolve(result);
    //     }
    //   });
    // });

    // Return success response
    res.status(201).json({
      status: "success",
      message: "DRC registered successfully.",
      data: {
        drc_id,
        drc_abbreviation: DRC_Abbreviation,
        drc_name: DRC_Name,
        contact_no: Contact_Number,
        drc_status: drcStatus,
        drc_end_date: drcEndDate,
        created_by: createdBy,
        created_dtm: create_dtm,
      },
    });
  } catch (error) {
    console.error("Unexpected error during DRC registration:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to register DRC.",
      errors: {
        exception: error.message,
      },
    });
  }
};

export const changeDRCStatus = async (req, res) => {
  const { drc_id, drc_status } = req.body;

  try {
    if (!drc_id || typeof drc_status === 'undefined') {
      return res.status(400).json({
        status: "error",
        message: "Failed to update DRC status.",
        errors: {
          code: 400,
          description: "DRC ID and status are required.",
        },
      });
    }

    /*
    // MySQL
    const updateStatusInMySQL = () =>
      new Promise((resolve, reject) => {
        const query = `
          UPDATE debt_recovery_company
          SET drc_status = ?
          WHERE drc_id = ?
        `;
        db.mysqlConnection.query(query, [drc_status, drc_id], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

    const mysqlResult = await updateStatusInMySQL();

    // Check if MySQL update affected any rows
    if (mysqlResult.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update DRC status.",
        errors: {
          code: 404,
          description: "No record found with the provided DRC ID.",
        },
      });
    }
    */

    //  Mongo
    const updateStatusInMongoDB = await DRC.findOneAndUpdate(
      { drc_id },
      { drc_status },
      { new: true }
    );

    // Check if MongoDB update 
    if (!updateStatusInMongoDB) {
      return res.status(404).json({
        status: "error",
        message: "Failed to update DRC status in MongoDB.",
        errors: {
          code: 404,
          description: "No DRC found in MongoDB for the given drc_id.",
        },
      });
    }

    // Response
    return res.status(200).json({
      status: "success",
      message: "DRC status updated successfully in MongoDB.",
      data: updateStatusInMongoDB,
    });

  } catch (err) {
    console.error("Error occurred while updating DRC status:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to update DRC status.",
      errors: {
        code: 500,
        description: "An unexpected error occurred. Please try again later.",
      },
    });
  }
};



export const getDRCDetails = async (req, res) => {
  //let mysqlData = null;
  let mongoData = null;

  //try {
  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company`;
  //     db.mysqlConnection.query(select_query, (err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({}).select('-services_of_drc');
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
     // mysql: mysqlData,
        mongoData:mongoData
      
    },
  });
};




export const getDRCDetailsById = async(req, res) => {

  //let mysqlData = null;
  let mongoData = null;
  const { DRC_ID } = req.body;

  if (!DRC_ID) {
        return res.status(400).json({
          status: "error",
          message: "Failed to retrieve DRC details.",
          errors: {
            code: 400,
            description: "DRC ID is required.",
          },
        });
  }
  // try {

  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company
  //                           WHERE drc_id = ?`;
  //     db.mysqlConnection.query(select_query, [DRC_ID],(err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({drc_id:DRC_ID}).select('-services_of_drc');
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      //mysql: mysqlData,
      mongoData:mongoData
      
    },
  });
};

export const getActiveDRCDetails= async(req, res) => {

  //let mysqlData = null;
  let mongoData = null;

  // try {
  //   mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `SELECT * FROM debt_recovery_company
  //                           WHERE drc_status='Active'`;
  //     db.mysqlConnection.query(select_query, (err, result) => {
  //       if (err) {
  //         return reject(new Error("Error retieving DRC details"));
  //       }
  //       resolve(result);
  //     });
  //   });
  // } catch (error) {
  //   console.error("MySQL fetch error:", error.message);
  // }

  
  try {
    mongoData = await DRC.find({drc_status:'Active'}).select('-services_of_drc');
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve DRC details.",
      errors: {
        code: 500,
        description: "Internal server error occurred while fetching DRC details.",
      },
    });
  }

  // if (!mysqlData || mysqlData.length === 0) {
  //   return res.status(500).json({
  //     status: "error",
  //     message: "Failed to retrieve DRC details.",
  //     errors: {
  //       code: 500,
  //       description: "Internal server error occurred while fetching DRC details.",
  //     },
  //   });
  // }

  return res.status(200).json({
    status: "success",
    message: "DRC details retrieved successfully.",
    data: {
      mongoData: mongoData,
      
    },
  });

};



export const getDRCWithServicesByDRCId = async(req, res) => {


  //let mysqlData = null;
  let mongoData = null;
  const  {DRC_ID} = req.body;   
  
  if(!DRC_ID){
    return res.status(404)
    .json({ 
      status:"error",
      message: "Failed to retrieve DRC details.", 
      errors:{
        "code":404,
        "description":"DRC with the given ID not found"
      } 
  });
  }
    // try {
    //   mysqlData = await new Promise((resolve, reject) => {
    //   const select_query = `
    //       SELECT drc.*, 
    //       CONCAT(
    //         '[',
    //          GROUP_CONCAT(
    //           '{"id":', drc_s.id,
    //           ',"service_id":', st.service_id,
    //           ',"service_type":"', st.service_type, '"', 
    //           ',"service_status":"', st.service_status, '"}' 
    //           SEPARATOR ','
    //             ),
    //             ']'
    //             )  AS services_of_drc            
    //           FROM debt_recovery_company drc
    //           LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
    //           LEFT JOIN service_type st ON drc_s.service_id = st.service_id
    //           WHERE drc.drc_id = ?
    //           GROUP BY drc.drc_id;
    //           `;
                      
    //           db.mysqlConnection.query(select_query,[DRC_ID], (err, result) => {
    //             if (err) {
    //               return reject(new Error("Failed to retireve DRC details"));
    //             }
    //             const final_result = result.map(data => ({
    //                   drc_id: data.drc_id,
    //                   drc_abbreviation: data.drc_abbreviation,
    //                   drc_name: data.drc_name,
    //                   drc_status: data.drc_status,
    //                   contact_no: data.contact_number,
    //                   drc_end_date: data.drc_end_date,
    //                   create_by: data.create_by,
    //                   create_dtm: data.create_dtm,
    //                   services_of_drc: JSON.parse(data.services_of_drc)  
    //             }));
    //               resolve(final_result);
    //           });
    //       });
                  
    //     } catch (error) {
    //         console.error("MySQL fetch error:", error.message);
    //     }
       
      try {
            mongoData = await DRC.find({drc_id:DRC_ID});
      } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Failed to retrieve DRC details.",
          errors: {
            code: 500,
            description: "Internal server error occurred while fetching DRC details.",
          },
        });
      }
                  
          // if (!mysqlData || mysqlData.length === 0) {
          //     return res.status(500).json({
          //               status: "error",
          //               message: "Failed to retrieve DRC details.",
          //               errors: {
          //                 code: 500,
          //                 description: "Internal server error occurred while fetching DRC details.",
          //               },
          //             });
          //           }
                  
              return res.status(200).json({
                      status: "success",
                      message: "DRC details retrieved successfully.",
                      data: {
                        mongoData: mongoData
                      },
                    });
};  
  


export const getDRCWithServices = async (req, res) => {
 
  //let mysqlData = null;
  let mongoData = null;
                  
  // try {
  //     mysqlData = await new Promise((resolve, reject) => {
  //     const select_query = `
  //         SELECT drc.*, 
  //         CONCAT(
  //           '[',
  //            GROUP_CONCAT(
  //             '{"id":', drc_s.id,
  //             ',"service_id":', st.service_id,
  //             ',"service_type":"', st.service_type, '"', 
  //             ',"service_status":"', st.service_status, '"}' 
  //             SEPARATOR ','
  //               ),
  //               ']'
  //               )  AS services_of_drc            
  //             FROM debt_recovery_company drc
  //             LEFT JOIN company_owned_services drc_s ON drc.drc_id = drc_s.drc_id
  //             LEFT JOIN service_type st ON drc_s.service_id = st.service_id
  //             GROUP BY drc.drc_id;
  //             `;
                      
  //             db.mysqlConnection.query(select_query, (err, result) => {
  //               if (err) {
  //                 return reject(new Error("Failed to retireve DRC details"));
  //               }
  //               const final_result = result.map(data => ({
  //                     drc_id: data.drc_id,
  //                     drc_abbreviation: data.drc_abbreviation,
  //                     drc_name: data.drc_name,
  //                     drc_status: data.drc_status,
  //                     contact_no: data.contact_number,
  //                     drc_end_date: data.drc_end_date,
  //                     create_by: data.create_by,
  //                     create_dtm: data.create_dtm,
  //                     services_of_drc: JSON.parse(data.services_of_drc)  
  //               }));
  //                 resolve(final_result);
  //             });
  //         });
                  
  //       } catch (error) {
  //           console.error("MySQL fetch error:", error.message);
  //       }
       
        try {
            mongoData = await DRC.find({});
          } catch (error) {
            return res.status(500).json({
              status: "error",
              message: "Failed to retrieve DRC details.",
              errors: {
                code: 500,
                description: "Internal server error occurred while fetching DRC details.",
              },
            });
          }
                  
          // if (!mysqlData  || mysqlData.length === 0) {
          //     return res.status(500).json({
          //               status: "error",
          //               message: "Failed to retrieve DRC details.",
          //               errors: {
          //                 code: 500,
          //                 description: "Internal server error occurred while fetching DRC details.",
          //               },
          //             });
          //           }
                  
              return res.status(200).json({
                      status: "success",
                      message: "DRC details retrieved successfully.",
                      data: {
                        // mysql: mysqlData,
                        mongoData: mongoData
                      },
                    });
};           
                  


