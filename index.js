const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'NULL') {
      return moment().toDate();
    }
  
    const formats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'MM/DD/YY'];
  
    for (const format of formats) {
      const date = moment(dateStr, format);
  
      if (date.isValid()) {
        return date.toDate();
      }
    }
  
    throw new Error(Invalid date format: ${dateStr});
  };
  
  const calculateDuration = (dateFrom, dateTo) => {
    if (!dateTo) {
      dateTo = moment().toDate();
    }
  
    const diff = moment(dateTo).diff(moment(dateFrom), 'days');
  
    return diff >= 0 ? diff : 0;
  };
  
  const findLongestPairs = (data) => {
    const pairs = {};
  
    for (const empId1 in data) {
      for (const empId2 in data) {
        if (empId1 < empId2) {
          const projIds1 = data[empId1].map((d) => d.projId);
          const projIds2 = data[empId2].map((d) => d.projId);
          const commonProjIds = projIds1.filter((p) => projIds2.includes(p));
  
          if (commonProjIds.length > 0) {
            let longestDuration = 0;
  
            for (const projId of commonProjIds) {
              const durations1 = data[empId1]
                .filter((d) => d.projId === projId)
                .map((d) => calculateDuration(d.dateFrom, d.dateTo));
  
              const durations2 = data[empId2]
                .filter((d) => d.projId === projId)
                .map((d) => calculateDuration(d.dateFrom, d.dateTo));
  
              for (const dur1 of durations1) {
                for (const dur2 of durations2) {
                  const totalDuration = dur1 + dur2;
  
                  if (totalDuration > longestDuration) {
                    longestDuration = totalDuration;
                    pairs[`${empId1},${empId2},${projId}`] = totalDuration;
                  }
                }
              }
            }
          }
        }
      }
    }
    return pairs;
  };
  
  const handleFileInput = (event) => {
    const file = event.target.files[0];
  
    const reader = new FileReader();
  
    reader.readAsText(file);
  
    reader.onload = () => {
      const data = processData(reader.result);
      const pairs = findLongestPairs(data);
  
      displayPairs(pairs);
    };
  };
  
  const processData = (csvData) => {
    const data = {};
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
  
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(',');
  
      if (row.length !== headers.length) {
        continue;
      }
  
      const empId = row[0];
      const projId = row[1];
      const dateFrom = parseDate(row[2]);
      const dateTo = parseDate(row[3]);
  
      if (!data[empId]) {
        data[empId] = [];
      }
  
      data[empId].push({ projId, dateFrom, dateTo });
    }
  
    return data;
  };
  
  const displayPairs = (pairs) => {
    const table = document.createElement('table');
  
    table.innerHTML = `
      <thead>
        <tr>
          <th>Employee ID #1</th>
          <th>Employee ID #2</th>
          <th>Project ID</th>
          <th>Days worked</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;
  
    const tbody = table.querySelector('tbody');
  
    for (const [key, value] of Object.entries(pairs)) {
      const [empId1, empId2, projId] = key.split(',');
      const row = document.createElement('tr');
  
      row.innerHTML = `
        <td>${empId1}</td>
        <td>${empId2}</td>
        <td>${projId}</td>
        <td>${value}</td>
      `;
  
      tbody.appendChild(row);
    }
  
    const resultsDiv = document.querySelector('#message');
  
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
  };
  
  const fileInput = document.querySelector('#file-input');
  
  fileInput.addEventListener('change', handleFileInput);