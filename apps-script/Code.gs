const SPREADSHEET_ID = '1n5F_tJpkB7IbqReuO04FQTF2RMVy-1OOM0c3ns8wXz4';

function doGet(e) { return handleRequest(e, 'GET'); }
function doPost(e) { return handleRequest(e, 'POST'); }

function handleRequest(e, method) {
  try {
    let data = e.parameter;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    const action = e.parameter.action || data.action;
    let result = {};

    switch(action) {
      case 'signup': result = signupUser(data); break;
      case 'login': result = loginUser(data); break;
      case 'getDashboard': result = getDashboard(data); break;
      case 'getAssessment': result = getAssessment(data); break;
      case 'saveAssessment': result = saveAssessment(data); break;
      case 'getAdminData': result = getAdminData(data); break;
      case 'getUsersList': result = getUsersList(data); break;
      case 'adminAddUser': result = adminAddUser(data); break;
      case 'adminRemoveUser': result = adminRemoveUser(data); break;
      case 'setupDummyData': result = setupDummyData(); break;
      default: result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function signupUser(data) {
  const sheet = getSheet('Users');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['UserID', 'EmpID', 'FirstName', 'LastName', 'Email', 'Password', 'Role', 'Dept']);
  }
  
  const userId = 'U' + (sheet.getLastRow()); // Row 1 is header, so row 1 = U1, row 2 = U2
  
  // Headers: UserID, EmpID, FirstName, LastName, Email, Password, Role, Dept
  // We force password to String just in case it's a number like 1234
  sheet.appendRow([userId, data.employeeId || '', data.firstName || '', data.lastName || '', data.email || '', String(data.password || ''), data.role || 'Employee', data.department || 'HR']);
  
  return { success: true, user: { id: userId, firstName: data.firstName, lastName: data.lastName, role: data.role || 'Employee', department: data.department } };
}

function loginUser(data) {
  const sheet = getSheet('Users');

  if (String(data.username) === 'admin' && String(data.password) === 'admin') {
    return { success: true, user: { id: 'U0', firstName: 'System', lastName: 'Admin', role: 'Admin', department: 'HR' } };
  }

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // We MUST force to String() because Google Sheets converts simple numeric passwords (like "1234") into Numbers, breaking standard equality.
    if ((String(row[4]) === String(data.username) || String(row[1]) === String(data.username)) && String(row[5]) === String(data.password)) {
      return { success: true, user: { id: row[0], firstName: row[2], lastName: row[3], role: row[6], department: row[7] } };
    }
  }
  return { success: false, error: 'Invalid credentials' };
}

function getDashboard(data) {
  const sheet = getSheet('Assessments');
  const resultsSheet = getSheet('Results');
  
  let pending = [];
  if (sheet.getLastRow() > 1) {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][4]) === 'Active') {
        pending.push({ id: rows[i][0], name: rows[i][1], time: rows[i][3] || '10 mins' });
      }
    }
  }

  let completedCount = 0;
  if (resultsSheet.getLastRow() > 1) {
    const resultsRows = resultsSheet.getDataRange().getValues();
    for (let i = 1; i < resultsRows.length; i++) {
      if (String(resultsRows[i][0]) === String(data.userId)) {
        completedCount++;
      }
    }
  }
  
  const assigned = pending.length;
  let progress = 0;
  if (assigned > 0) {
    progress = Math.round((completedCount / assigned) * 100);
    if (progress > 100) progress = 100;
  }

  return { success: true, data: { pendingTasks: pending, assigned: assigned, completed: completedCount, progress: progress } };
}

function getAssessment(data) {
  const aSheet = getSheet('Assessments');
  const qSheet = getSheet('Questions');
  const oSheet = getSheet('Options');
  
  const assessmentId = data.id || 'A1';
  let assessmentName = 'Financial Assessment';
  let assessmentDesc = 'Complete this assessment.';
  
  if (aSheet.getLastRow() > 1) {
    const aRows = aSheet.getDataRange().getValues();
    for(let i=1; i<aRows.length; i++) {
      if (String(aRows[i][0]) === String(assessmentId)) {
        assessmentName = aRows[i][1];
        assessmentDesc = aRows[i][3];
        break;
      }
    }
  }
  
  let questions = [];

  if (qSheet.getLastRow() > 1 && oSheet.getLastRow() > 1) {
    const qRows = qSheet.getDataRange().getValues();
    const oRows = oSheet.getDataRange().getValues();

    for (let i = 1; i < qRows.length; i++) {
      if (String(qRows[i][1]) === String(assessmentId)) {
        let q = { id: qRows[i][0], text: qRows[i][2], type: qRows[i][3], options: [] };
        for (let j = 1; j < oRows.length; j++) {
          if (String(oRows[j][1]) === String(q.id)) {
            q.options.push({ id: oRows[j][0], text: oRows[j][2], weight: oRows[j][3] });
          }
        }
        questions.push(q);
      }
    }
  }

  return { success: true, data: { id: assessmentId, name: assessmentName, description: assessmentDesc, questions: questions } };
}

function saveAssessment(data) {
  const results = getSheet('Results');
  const responses = getSheet('Responses');
  
  if (results.getLastRow() === 0) results.appendRow(['UserID', 'AssID', 'Score', 'Profile', 'Date']);
  if (responses.getLastRow() === 0) responses.appendRow(['ResID', 'UserID', 'AssID', 'QID', 'Answer']);
  
  const timestamp = new Date().toISOString();
  
  results.appendRow([data.userId, data.assessmentId, data.score, data.profile, timestamp]);
  
  if (data.answers) {
    const timeId = new Date().getTime();
    for (const [qId, ansId] of Object.entries(data.answers)) {
      if (Array.isArray(ansId)) {
        ansId.forEach(a => responses.appendRow([timeId, data.userId, data.assessmentId, qId, a]));
      } else {
        responses.appendRow([timeId, data.userId, data.assessmentId, qId, ansId]);
      }
    }
  }
  
  return { success: true };
}

function getAdminData(data) {
  const usersSheet = getSheet('Users');
  const resultsSheet = getSheet('Results');
  
  let totalUsers = Math.max(0, usersSheet.getLastRow() - 1);
  let totalCompleted = Math.max(0, resultsSheet.getLastRow() - 1);
  let totalScore = 0;
  let avgScore = 0;
  let recent = [];
  
  let userMap = {};
  if (totalUsers > 0) {
    const uRows = usersSheet.getDataRange().getValues();
    for (let i = 1; i < uRows.length; i++) {
      userMap[String(uRows[i][0])] = { name: uRows[i][2] + ' ' + uRows[i][3], dept: uRows[i][7] };
    }
  }

  if (totalCompleted > 0) {
    const resRows = resultsSheet.getDataRange().getValues();
    for (let i = 1; i < resRows.length; i++) {
      totalScore += Number(resRows[i][2]);
    }
    avgScore = Math.round(totalScore / totalCompleted);
    
    const start = Math.max(1, resRows.length - 5);
    for (let i = resRows.length - 1; i >= start; i--) {
      const uId = String(resRows[i][0]);
      const name = userMap[uId] ? userMap[uId].name : 'Unknown User';
      const dept = userMap[uId] ? userMap[uId].dept : '-';
      
      const dateObj = new Date(resRows[i][4]);
      const dateStr = dateObj.toLocaleDateString() || resRows[i][4];

      recent.push({ 
        name: name, 
        dept: dept, 
        assessment: 'Financial Confidence',
        score: resRows[i][2], 
        profile: resRows[i][3], 
        date: dateStr 
      });
    }
  }

  return { success: true, data: { totalUsers, totalCompleted, avgScore, recentActivity: recent } };
}

// --- LMS Phase 1: User Management ---

function getUsersList(data) {
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  let users = [];
  
  if (rows.length > 1) {
    for (let i = 1; i < rows.length; i++) {
      // UserID, EmpID, FirstName, LastName, Email, Password, Role, Dept
      users.push({
        id: rows[i][0],
        firstName: rows[i][2],
        lastName: rows[i][3],
        email: rows[i][4],
        role: rows[i][6],
        department: rows[i][7]
      });
    }
  }
  return { success: true, users: users };
}

function adminAddUser(data) {
  const sheet = getSheet('Users');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['UserID', 'EmpID', 'FirstName', 'LastName', 'Email', 'Password', 'Role', 'Dept']);
  }
  
  // Find highest user ID number to append properly even if rows were deleted
  let maxId = 0;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const currentId = String(rows[i][0]).replace('U', '');
    if (!isNaN(currentId) && parseInt(currentId) > maxId) {
      maxId = parseInt(currentId);
    }
  }
  
  const userId = 'U' + (maxId + 1);
  
  // Force append with specific role
  sheet.appendRow([
    userId, 
    data.email, // using email as EmpID for simplicity if not provided
    data.firstName || '', 
    data.lastName || '', 
    data.email || '', 
    String(data.password || ''), 
    data.role || 'Employee', 
    data.department || 'HR'
  ]);
  
  return { success: true, message: 'User added successfully', userId: userId };
}

function adminRemoveUser(data) {
  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.userId)) {
      // row index is i, but sheet row number is i + 1
      sheet.deleteRow(i + 1);
      return { success: true, message: 'User deleted successfully' };
    }
  }
  return { success: false, error: 'User not found' };
}

function setupDummyData() {
  ['Users', 'Assessments', 'Questions', 'Options', 'Responses', 'Results'].forEach(name => {
    let s = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
    if (!s) s = SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(name);
    s.clear();
  });
  
  getSheet('Users').appendRow(['UserID', 'EmpID', 'FirstName', 'LastName', 'Email', 'Password', 'Role', 'Dept']);
  getSheet('Assessments').appendRow(['AssID', 'Name', 'Category', 'Desc', 'Status']);
  getSheet('Questions').appendRow(['QID', 'AssID', 'Question', 'Type', 'Weight', 'Req']);
  getSheet('Options').appendRow(['OptID', 'QID', 'OptionText', 'Weight']);
  getSheet('Results').appendRow(['UserID', 'AssID', 'Score', 'Profile', 'Date']);
  getSheet('Responses').appendRow(['ResID', 'UserID', 'AssID', 'QID', 'Answer']);

  getSheet('Assessments').appendRow(['A1', 'Financial Confidence', 'General', 'Baseline survey covering budget, savings, and debt.', 'Active']);
  
  getSheet('Questions').appendRow(['Q1', 'A1', 'How often do you track your monthly expenses?', 'single', 10, true]);
  getSheet('Options').appendRow(['O1', 'Q1', 'Every day', 10]);
  getSheet('Options').appendRow(['O2', 'Q1', 'A few times a month', 5]);
  getSheet('Options').appendRow(['O3', 'Q1', 'Rarely or never', 0]);

  getSheet('Questions').appendRow(['Q2', 'A1', 'Do you have an emergency fund?', 'single', 10, true]);
  getSheet('Options').appendRow(['O4', 'Q2', 'Yes, fully funded (6+ months)', 10]);
  getSheet('Options').appendRow(['O5', 'Q2', 'Yes, partially funded (1-3 months)', 5]);
  getSheet('Options').appendRow(['O6', 'Q2', 'No, but planning to start', 2]);
  getSheet('Options').appendRow(['O7', 'Q2', 'No emergency fund', 0]);

  return { success: true, message: 'Database setup complete!' };
}
