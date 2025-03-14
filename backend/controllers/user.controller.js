import User from '../models/user.model.js';

export const getUserProfile = async (req, res) => { 
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
}catch(error) {
    console.error("Error in getUserProfile: ", error.message);
    res.status(500).json({ error: "Internal server Error" });
}
}

export const followUnfollowUser = async (req, res) => {
    try {    
        const { id } = req.params;
        const userTomodify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id) {
            return res.status(400).json({ error: "You can't follow/unfollow yourself" });
        }

        if(!userTomodify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isAlreadyFollowing = currentUser.following.includes(id);  

        if(isAlreadyFollowing) {
            // unfollow User
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });   
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            // follow User
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
            
            const newNotification = new Notification({
                from: req.user._id,
                to: userTomodify._id,
                type: "follow"
            });
            await newNotification.save();

            
            res.status(200).json({ message: "Followed successfully" });
        }

    }catch(error) {
        console.error("Error in followUnfollowUser: ", error.message);
        res.status(500).json({ error: "Internal server Error" });
    }
}