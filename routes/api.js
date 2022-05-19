'use strict';

module.exports = function (app) {
  //object to hold all issues for all projects
  let issues = {};
  
  app.route('/api/issues/:project')
    
    .get(function (req, res){
      let project = req.params.project;
      
      let query = req.query;

      //Check if there are no query parameters by checking the keys of query. 
      //If there are no keys/properties, emptyQuery is true and we skip the filter.
      //If there are keys/properties, emptyQuery is false and we enter the filter process.
      let emptyQuery = true;
      for(let key in query){
        if(query.hasOwnProperty(key)){
          emptyQuery = false;
          break;
        }
      }
      
      if(!emptyQuery){
        let filteredIssues = issues[project].filter((issue)=>{
          for(let key in query){
            if(issue[key] !== query[key]){
              return false;
            }
          }
          return true;
        });
        return res.json(filteredIssues);
      }
      
      res.json(issues[project]);
    })
    
    .post(function (req, res){
      let project = req.params.project;
      //if the issues object does not contain the current project, Add an array
      if(!issues[project]){
        issues[project] = [];
      }
      //get all possible inputs from the form
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      //If any of the required fields are empty, return an error
      if(!issue_title || !issue_text || !created_by){
        return res.json({
          error: 'required field(s) missing'
        })
      }
      //If the optional fields, assigned to or status text, are not supplied,
      //enter an empty string
      if(!assigned_to){
        assigned_to = '';
      }
      if(!status_text){
        status_text = '';
      }
      
      //create random id for each new issue and the current date
      let _id = Math.random().toString(36).slice(2);
      let currentDate = new Date();
      
      let issue = {
        _id: _id,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
        open: true,
        created_on: currentDate,
        updated_on: currentDate
        
      }
      
      //Add the issue to the project array
      issues[project].push(issue);
      
      return res.json(issue);
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
      //create new object for update fields
      //only add fields with update fields filled in
      let update = {};
      for(let key in req.body){
        if(req.body[key] !== ''){
          update[key] = req.body[key];
        }
      }
      //If there is no id, return missing id
      if(!update._id){
        return res.json({error: 'missing _id'})
      }
      //There must be at least 2 keys, (1 id and 1 other to update)
      else if(Object.keys(update).length < 2){
        return res.json({
          error: 'no update field(s) sent',
          _id: update._id          
        })
      }
      //find the correct issue
      let issue = issues[project].find((issue)=> issue._id === update._id);
      //if there is no issue matching the id, return error
      if(!issue){
        return res.json({
          error: 'could not update',
          _id: update._id
        })
      }
      
      let index = issues[project].indexOf(issue);
      //update the issue by joining the old issue and the update
      //also give updated_on a new date
      let updatedIssue = {...issue, ...update};
      updatedIssue.updated_on = new Date();
      
      issues[project][index] = updatedIssue;
      
      res.json({
        result: 'successfully updated',
        _id: update._id
      });
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let {_id} = req.body;
      //If no id was supplied, return error
      if(!_id){
        return res.json({error: 'missing _id'})
      }
      //find the issue with matching id
      let issue = issues[project].find((issue)=> issue._id === _id);
      //if no issue matches the id, return error
      if(!issue){
        return res.json({
          error: 'could not delete',
          _id: _id
        })
      }
      let index = issues[project].indexOf(issue);

      //remove the issue from the project array
      issues[project].splice(index, 1);

      res.json({
        result: 'successfully deleted',
        _id: _id
      })
    });
    
};
