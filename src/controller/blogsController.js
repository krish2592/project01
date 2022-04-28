const blogsModel = require("../model/blogsModel");
const authorModel = require('../model/authorModel')

//=========== Create Blogs ====================//

//------------validation function-----------//
let isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const blogs = async (req, res) => {
  try {
    let blogData = req.body;
    let author = await authorModel.findById(blogData.authorId);
    if (!author) {
      return res.send("msg: Invalid Author Id");
    }
    if (Object.keys(blogData).length == 0) {
      res
        .status(400)
        .send({
          status: false,
          msg: "BAD REQUEST, Please provide blog details ",
        });
      return;
    }
    if (!isValid(blogData.title)) {
      return res.status(400).send({ status: false, msg: "title is required" });
    }
    if (!isValid(blogData.body)) {
      return res.status(400).send({ status: false, msg: "body is required" });
    }
    if (!isValid(blogData.authorId)) {
      return res
        .status(400)
        .send({ status: false, msg: "authorId is required" });
    }
    if (!isValid(blogData.category)) {
      return res
        .status(400)
        .send({ status: false, msg: "category is required" });
    }
    let savedBlogData = await blogsModel.create(blogData);
    return res.status(201).send({ status: true, msg: savedBlogData });
  } catch (error) {
    console.log("This is the error:", error.message);
    return res.status(500).send({ status: false, msg: error.message });
  }
};

//=========== Update Blogs ====================//

const updateBlog = async (req, res) => {
  try {
    let blogId = req.params.blogId;
    let data = await blogsModel.find({$in: [{ _id: blogId, isDeleted: false}]});
    console.log(data);
    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, msg: "Data is incorrect" });
    }
    let { title, body, tags, subcategory } = req.body;
    let newBlog = await blogsModel
      .findOneAndUpdate(
        { data },
        {
          $addToSet: { subcategory: subcategory, tags: tags },
          title: title,
          body: body,
          isPublished: true,
          publishedAt: new Date().toLocaleString(),
        },
        { new: true }
      )
      .populate("authorId");

    res.status(200).send({ status: true, data: newBlog });
  } catch (err) {
    console.log(err.message);
    res.status(500).send({ error: err.message });
  }
};

//=========== Get Blogs ====================//

let getSelectiveBlogs = async function (req, res) {
  try { 

    const data = req.query;
    let blogs = await blogsModel.find({$and: [{isDeleted: false}, {isPublished: true} ]});
    console.log(blogs)
    if (blogs.length==0) {
      res.status(404).send({ status: false, msg: "No such blog eists" });
    }
    res.status(200).send({ status: true, data: blogs });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};



  

//=========== Delete Blogs By Id ====================//

const deletBlog = async function (req, res) {
  let blogId = req.params.blogId;
  let blog = await blogsModel.findById(blogId);
  if (!blog) {
    return res.status(404).send({ status: false, msg: "blogId not found" });
  }
  let deletedBlog = await blogsModel.updateMany(
    { _id: blogId },
    { isDeleted: true, deletedAt: new Date().toLocaleString() },
    { new: true }
  );
  res.status(200).send({ data: deletedBlog, status: true });
};

//=========== Delete Blogs By Query ====================//

const delBlogsByQuery = async function (req, res) {
  let category = req.query.category;
  let authorid = req.query.authorid;
  let tagName = req.query.tag;
  let subcategoryName = req.query.subcategory;

  let document = await blogsModel.find({
    $in: [
      { category: category },
      { authorid: authorid },
      { tag: tagName },
      { subcategory: subcategoryName },
    ],
  });
  if (!document) {
    return res.status(404).send({ status: false, msg: "blog not found" });
  }
  let deletedBlog = await blogsModel.updateMany(
    { isPublihed: true },
    { isDeleted: true },
    { new: true }
  );
  res.status(200).send({ status: true, data: deletedBlog });
};

module.exports.updateBlog = updateBlog;
module.exports.blogs = blogs;
module.exports.getSelectiveBlogs = getSelectiveBlogs;
module.exports.deletBlog = deletBlog;
module.exports.delBlogsByQuery = delBlogsByQuery;