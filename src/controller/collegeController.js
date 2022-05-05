const collegeModel = require("../model/collegeModel");
const { isValidRequestBody, isValid } = require("./validator")

const createCollege = async (req, res) => {
    try {
        const data = req.body;

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, msg: "Data not found" })

        let { name, fullName, logoLink } = data

        if (!isValid(name)) return res.status(400).send({ status: false, msg: "Name is required" })
        if (!isValid(fullName)) return res.status(400).send({ status: false, msg: "Full name is required" })
        if (!isValid(logoLink)) return res.status(400).send({ status: false, msg: "Logo link is required" })

        let collegeData = { name, fullName, logoLink }
        let college = await collegeModel.create(collegeData)

        return res.status(201).send({ status: true, data: college })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { createCollege };