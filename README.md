# debt-recovery-system-backend
A backend server built using (node.js,Express,mysql,mongo), for handling backend requests, managing databases, and integrating with external services


## Setup Instructions

### Cloning the Repository

### 1. Clone the repository to your local machine:
#### Open your terminal and run the following command to clone the repository
    
     -git clone https://github.com/kvsdevinda/debt-recovery-system-backend.git
     

### 2. Change directory to the debt-recovery-backend folder:
     
     cd debt-recovery-backend
     

### 3.Install the required dependencies listed in package.json:
    
     npm install
     

-----------------------------------------------------------------------------------------------------------------------------------------------

## Branching Workflow

 Please follow these steps when working on new features or tasks

### 1. Ensure your local main branch is up to date with the remote main branch:
     
     git checkout main
     git pull origin main
     

### 2. Create a new branch for the task or feature you are working on. Use descriptive names for feature branches:
    
     git checkout -b your-branch-name
     

### 3. After completing your changes, *stage* and *commit* your changes:
    
     git add .
     git commit -m "Add a description of your changes"
     

### 4. Push your feature branch to the remote repository:
    
     git push origin feature/your-feature-name
     

### 5. Once your changes are pushed, create a Pull Request on GitHub to merge your feature branch into the main branch.
#### Request a review from teammates, and once reviewed, your Pull Request will be merged into the main branch.

-------------------------------------------------------------------------------------------------------------------------------

## Backend develpment instruction

### 1. Set up your MySQL Database:
   How to Import the Database on Machine
  Download the File to the Computer:

  Place the .sql file in an accessible location.
  Open phpMyAdmin:

  Start XAMPP and ensure MySQL is running.
  Open http://localhost/phpmyadmin in a browser.
  Create an Empty Database:

  Go to the Databases tab in phpMyAdmin.
  Create a new database with a name ( debt_recovery_system ) and click Create.
  Import the File:

  Select the newly created database from the sidebar.
  Click the Import tab at the top.
  Click Choose File and select the .sql file you received.
  Click Go to import the database.
     

### 2. This is the comment structure. you have to add comments like this, to the top of all the development files.
#### example :
    Purpose: This template is used for the agent registration page.
    Created Date: 2024-06-19
    Created By: Your Name (your mail)
    Last Modified Date: 2024-07-04
    Modified By: Your Name (your mail)
    Version: Laravel 11
    Dependencies: Bootstrap
    Related Files: AgentController.php (controller), agent.php (model), web.php (routes)
    Notes: This template uses a Bootstrap form for the registration fields. 

--------------------------------------------------------------------------------------------------------------------------
## Best Practice

### 1. Use clear, descriptive commit messages to explain what changes have been made and why.
   

### 2. Always create a Pull Request (PR) to merge your feature branch into the main branch.
#### Request a review from teammates and address any feedback before merging.

### 3. Use descriptive names for your feature branches.
#### For example: feature/RO-api
     
#### This will make it easy to identify the purpose of each branch.

### 4. Do not merge your own pull requests. Have at least one teammate review and approve the changes before merging.
#### Merge into the main branch only after receiving approval from teammates
