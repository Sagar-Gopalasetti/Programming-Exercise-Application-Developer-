const fs = require('fs');

function trainingData(filePath) {

    const startFiscalYear = new Date('2023-07-01');
    const endFIscalYear = new Date('2024-06-30');
    const trainingsList = ["Electrical Safety for Labs", "X-Ray Safety", "Laboratory Safety Training"];
    const expirationDate = new Date('2023-10-01');
    const oneMonthLater = new Date(expirationDate);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1); // One month after the specified date.



    const trainingsCount = {};
    const fiscalYearTrainings = {};
    const expiredTrainings = {};
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const latestCompletions = {};
    //Object to populate most recent training completions for each person ans specified.

    data.forEach(person => {

        const name = person.name
        person.completions.forEach(completion =>{
            const trainingName = completion.name;
            const timestamp = new Date(completion.timestamp)
            const expires = completion.expires ? new Date(completion.expires) : null;

            if(!latestCompletions[name]) {
                latestCompletions[name] = {}
            }

            if (!latestCompletions[name][trainingName]|| latestCompletions[name][trainingName].timestamp<timestamp) {
                latestCompletions[name][trainingName] = {
                    timestamp: timestamp,
                    expires : expires
                }               
            }
        })        
    });

    //Using the latest completions object for all the three tasks.

    Object.keys(latestCompletions).forEach(person =>{
        Object.keys(latestCompletions[person]).forEach(trainingName =>{
            const completion = latestCompletions[person][trainingName];

            // Counting each completed trainings (Task 1)
            trainingsCount[trainingName] = (trainingsCount[trainingName]||0)+1;

            // People completed the trainings in given fiscal Year. (Task 2)
            if(trainingsList.includes(trainingName) && completion.timestamp<=endFIscalYear && completion.timestamp >= startFiscalYear){
                fiscalYearTrainings[trainingName] = fiscalYearTrainings[trainingName] || [];
                fiscalYearTrainings[trainingName].push(person);

            }
            
            // Expired or expiring soon trainings. (Task 3)
            if(completion.expires && (completion.expires <= expirationDate || completion.expires>expirationDate && completion.expires< oneMonthLater )){
                expiredTrainings[person] = expiredTrainings[person] || [];
                const status = completion.expires > expirationDate ? "expired" : "expires soon" ;
                expiredTrainings[person].push({training : trainingName, status});
                            }

        })
    })

    

         // Writing latestCompletions to a file
        fs.writeFileSync('trainingsCount.json', JSON.stringify(trainingsCount, null, 2), 'utf8');

        // Writing fiscalYearTrainings to a file
        fs.writeFileSync('fiscalYearTrainings.json', JSON.stringify(fiscalYearTrainings, null, 2), 'utf8');

        // Writing expiredTrainings to a file
        fs.writeFileSync('expiredTrainings.json', JSON.stringify(expiredTrainings, null, 2), 'utf8');
    
    

}

trainingData('trainings.txt')
console.log("Check for respective JSON files for outputs")
