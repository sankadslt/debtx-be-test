import { Schema, model } from 'mongoose';

const incidentLogSchema = new Schema({
    Incident_Id: { type: Number, required: true, unique: true },
    Account_Num: { type: String, required: true },
    Actions: {
        type: String,
        required: true,
        enum: ["collect arrears", "collect arrears and CPE", "collect CPE"], // Enum validation
    },
    Monitor_Months: { type: Number, required: true }, // New field
    Created_By: { type: String, required: true },
    Created_Dtm: { type: Date, required: true },
},{
    collection: 'Incident_log', // Specify the collection name
    timestamps: true
});

const Incident_log = model('Incident_log', incidentLogSchema);

export default Incident_log;
