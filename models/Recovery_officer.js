// Recovery Officer.js - model
// import { Schema, model } from 'mongoose';

// // Sub-schema for RTOM status
// const rtomStatusSchema = new Schema({
//     status: {
//         type: String,
//         enum: ['Active', 'Inactive', 'Pending'],
//         required: true,
//     },
//     rtoms_for_ro_status_date: {
//         type: String, // Save date in day/month/year format
//         required: true,
//     },
//     rtoms_for_ro_status_edit_by: {
//         type: String,
//         required: true,
//     },
// });

// // Sub-schema for RTOMs assigned to a Recovery Officer
// const rtomforRoSchema = new Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     status: {
//         type: [rtomStatusSchema], // Status array with subfields
//         required: true,
//     },
// });

// // Sub-schema for remarks
// const remarkSchema = new Schema({
//     remark: {
//         type: String,
//         required: true,
//     },
//     remark_date: {
//         type: String, // Save date in day/month/year format
//         required: true,
//     },
//     remark_edit_by: {
//         type: String,
//         required: true,
//     },
// });

// // Sub-schema for Recovery Officer status updates
// const roStatusSchema = new Schema({
//     status: {
//         type: String,
//         enum: ['Active', 'Inactive', 'Pending'],
//         required: true,
//     },
//     ro_status_date: {
//         type: String, // Save date in day/month/year format
//         required: true,
//     },
//     ro_status_edit_by: {
//         type: String,
//         required: true,
//     },
// });

// // Main schema for Recovery Officer
// const roSchema = new Schema(
//     {
//         ro_id: {
//             type: Number,
//             required: true,
//             unique: true,
//         },
//         ro_name: {
//             type: String,
//             required: true,
//         },
//         ro_contact_no: {
//             type: String,
//             required: true,
//         },
//         ro_status: {
//             type: [roStatusSchema], // Status array with subfields
//             required: true,
//             default: [], // Default empty array
//         },
//         drc_name: {
//             type: String,
//             required: true,
//         },
//         rtoms_for_ro: {
//             type: [rtomforRoSchema], // RTOMs array with statuses
//             required: true,
//         },
//         login_type: {
//             type: String,
//             required: true,
//         },
//         login_user_id: {
//             type: String,
//             required: true,
//         },
//         remark: {
//             type: [remarkSchema], // Remark array with date and editor
//             default: [], // Default empty array
//         },
//         ro_nic: {
//             type: String,
//             required: true,
//         },
//         ro_end_date: {
//             type: Date,
//             default: null, // Default to null for no end date
//         },
//         created_by: {
//             type: String,
//             required: true, // Track who created the officer
//         },
//         createdAt: {
//             type: String, // Explicitly store as string in "DD/MM/YYYY" format
//             required: true,
//         },
//         updatedAt: {
//             type: Date, // Use Date for `updatedAt`
//             default: Date.now,
//         },
//     },
//     {
//         collection: 'Recovery_officer',
//     }
// );

// // Pre-save hook to ensure unique RTOM names for this Recovery Officer
// roSchema.pre('save', async function(next) {
//     try {
//         const existingRO = await RO.findOne({ 
//             ro_id: this.ro_id, 
//             'rtoms_for_ro.name': { $in: this.rtoms_for_ro.map(r => r.name) } 
//         });
        
//         if (existingRO) {
//             return next(new Error('One or more RTOM names already exist for this Recovery Officer.'));
//         }

//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// const RO = model('RO', roSchema);

// export default RO;


// Recovery Officer.js - model
import { Schema, model } from 'mongoose';

// Helper function to format date in MM/DD/YYYY
function formatDate(date) {
    const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// Sub-schema for RTOM status
const rtomStatusSchema = new Schema({
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        required: true,
    },
    rtoms_for_ro_status_date: {
        type: Date, // Change to Date type
        required: true,
    },
    rtoms_for_ro_status_edit_by: {
        type: String,
        required: true,
    },
});

// Sub-schema for RTOMs assigned to a Recovery Officer
const rtomforRoSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: [rtomStatusSchema], // Status array with subfields
        required: true,
    },
    rtom_id:Number
});

// Sub-schema for remarks
const remarkSchema = new Schema({
    remark: {
        type: String,
        required: true,
    },
    remark_date: {
        type: Date, // Change to Date type
        required: true,
    },
    remark_edit_by: {
        type: String,
        required: true,
    },
});

// Sub-schema for Recovery Officer status updates
const roStatusSchema = new Schema({
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Pending'],
        required: true,
    },
    ro_status_date: {
        type: Date, // Change to Date type
        required: true,
    },
    ro_status_edit_by: {
        type: String,
        required: true,
    },
});

// Main schema for Recovery Officer
const roSchema = new Schema(
    {
        ro_id: {
            type: Number,
            required: true,
            unique: true,
        },
        ro_name: {
            type: String,
            required: true,
        },
        ro_contact_no: {
            type: String,
            required: true,
        },
        ro_status: {
            type: [roStatusSchema], // Status array with subfields
            required: true,
            default: [], // Default empty array
        },
        drc_name: {
            type: String,
            required: true,
        },
        rtoms_for_ro: {
            type: [rtomforRoSchema], // RTOMs array with statuses
            required: true,
        },
        login_type: {
            type: String,
            required: true,
        },
        login_user_id: {
            type: String,
            required: true,
        },
        remark: {
            type: [remarkSchema], // Remark array with date and editor
            default: [], // Default empty array
        },
        ro_nic: {
            type: String,
            required: true,
        },
        ro_end_date: {
            type: Date,
            default: null, // Default to null for no end date
        },
        created_by: {
            type: String,
            required: true, // Track who created the officer
        },
        createdAt: {
            type: Date, // Change to Date type
            required: true,
        },
        updatedAt: {
            type: Date, // Keep Date type for `updatedAt`
            default: Date.now,
        },
    },
    {
        collection: 'Recovery_officer',
    }
);

// Pre-save hook to ensure unique RTOM names for this Recovery Officer
roSchema.pre('save', async function (next) {
    try {
        const existingRO = await RO.findOne({
            ro_id: this.ro_id,
            'rtoms_for_ro.name': { $in: this.rtoms_for_ro.map(r => r.name) }
        });

        if (existingRO) {
            return next(new Error('One or more RTOM names already exist for this Recovery Officer.'));
        }

        // Ensure date fields are formatted correctly
        this.createdAt = formatDate(this.createdAt || new Date());
        this.updatedAt = new Date();
        this.ro_status.forEach(status => {
            status.ro_status_date = formatDate(status.ro_status_date || new Date());
        });
        this.rtoms_for_ro.forEach(rtom => {
            rtom.status.forEach(rtomStatus => {
                rtomStatus.rtoms_for_ro_status_date = formatDate(rtomStatus.rtoms_for_ro_status_date || new Date());
            });
        });
        this.remark.forEach(rem => {
            rem.remark_date = formatDate(rem.remark_date || new Date());
        });

        next();
    } catch (error) {
        next(error);
    }
});

const RO = model('RO', roSchema);

export default RO;
