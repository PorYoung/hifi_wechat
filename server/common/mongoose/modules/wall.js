import mongoose from '../config'
//设计消息类模板
const wallSchema = new mongoose.Schema({
    username: {
        type:String,
        require:[true,'username is necessary']
    },
    flags: {},
    votes:Array,
    activeVote:{},
    guests: Array,
    QRSrc: String,
    QRTicket: String,
    UI: Object
})
const wall = mongoose.model('wall', wallSchema)
export default wall