/**
 * Created by jsche on 12/5/2017.
 */
function main() {

    var twoDaysAgo = dateToOADate(new Date(), 2);
    var attr=[
        {
            name:"update_custom",
            value:"1"
        }
    ];

    var project = new NSOA.record.oaProject();
    project.team_requested_processed__c="";
    project.id=339;

    var projectRequest ={
        type:"Project",
        method:"equal to",
        fields:"",
        attributes:[
            {
                name:"limit",
                value:"1000"
            },
            {
                name:"filter",
                value:"newer-than"
            }
        ],
        objects:[project, twoDaysAgo]
    };
    var projectResults = NSOA.wsapi.read(projectRequest);
    if (projectResults[0].objects !== null) {
        for (var i=0; i<projectResults[0].objects.length; i++) {

            //if (projectResults[0].objects[i].team_requested_processed__c === "") {

            NSOA.meta.log("info","Project: "+projectResults[0].objects[i].id);

            var startDate = projectResults[0].objects[i].start_date;
            var projId = projectResults[0].objects[i].id;
            var start = new Date(projectResults[0].objects[i].start_date.substr(0, 10)+"T04:00:00Z").getTime();
            var durationWeeks = parseFloat(projectResults[0].objects[i].weeks__c);
            var duration = parseFloat(projectResults[0].objects[i].weeks__c) * 7 * 24 * 60 * 60 * 1000;
            var end = (start + duration) - 86400000;
            var endDate = new Date(end);
            var endString = getDateString(endDate, "yyyy-MM-dd");

            NSOA.meta.log("info", "Start Date: " + startDate);
            NSOA.meta.log("info", "Start: " + start);
            NSOA.meta.log("info", "Duration: " + duration);
            NSOA.meta.log("info", "End: " + end);
            NSOA.meta.log("info", "End String: " + endString);

            var projLead = projectResults[0].objects[i].proj_lead__c;
            var srConsultant = projectResults[0].objects[i].sr_consultant__c;
            var consultant = projectResults[0].objects[i].consultant__c;
            var srAnalyst = projectResults[0].objects[i].sr_analyst__c;
            var analyst = projectResults[0].objects[i].analyst__c;

            NSOA.meta.log("info", "Proj Lead: " + projLead);
            NSOA.meta.log("info", "Senior Consultant: " + srConsultant);
            NSOA.meta.log("info", "Consultant: " + consultant);
            NSOA.meta.log("info", "Senior Analyst: " + srAnalyst);
            NSOA.meta.log("info", "Analyst: " + analyst);

            // Hours calculations:

            var projLeadHours = projLead * 40 * durationWeeks;
            var srConsultantHours = srConsultant * 40 * durationWeeks;
            var consultantHours = consultant * 40 * durationWeeks;
            var srAnalystHours = srAnalyst * 40 * durationWeeks;
            var analystHours = analyst * 40 * durationWeeks;

            //

            NSOA.meta.log("trace", "Proj Lead Hours: " + projLeadHours);
            NSOA.meta.log("trace", "Senior Consultant Hours: " + srConsultantHours);
            NSOA.meta.log("trace", "Consultant Hours: " + consultantHours);
            NSOA.meta.log("trace", "Senior Analyst Hours: " + srAnalystHours);
            NSOA.meta.log("trace", "Analyst Hours: " + analystHours);

            if (projectResults[0].objects[i].proj_lead_date__c !== "0000-00-00") { // 00-00-0000
                startDate = projectResults[0].objects[i].proj_lead_date__c;
            }
            else {
                var upd1=new NSOA.record.oaProject();
                upd1.id=projId;
                upd1.proj_lead_date__c=startDate;
                upd1.proj_lead_end__c=endString;
                var upd1_results=NSOA.wsapi.modify(attr,[upd1]);
                if(upd1_results[0].status!="U") {
                    NSOA.meta.log("error","ERR: upd1: "+upd1_results[0].errors[0].code);
                }
            }

            if(projLeadHours>0) {
                var projLeadBooking = new NSOA.record.oaBooking();
                projLeadBooking.userid = 8;
                projLeadBooking.customerid = projectResults[0].objects[i].customerid;
                projLeadBooking.hours = projLeadHours;
                projLeadBooking.booking_typeid = 4; // tentative
                projLeadBooking.projectid = projId;
                projLeadBooking.as_percentage = "";
                projLeadBooking.startdate = startDate;
                projLeadBooking.enddate = endString;
                var add1 = NSOA.wsapi.add([projLeadBooking]);

                if (add1[0].status!="A") {
                    NSOA.meta.log("info",add1[0].errors[0].code);
                }
                else {
                    NSOA.meta.log("info", "Add 1 Successful");
                }
            }

            if (projectResults[0].objects[i].sr_consultant_date__c !== "0000-00-00") { // 00-00-0000
                startDate = projectResults[0].objects[i].sr_consultant_date__c;
            }
            else {
                var upd2=new NSOA.record.oaProject();
                upd2.id=projId;
                upd2.sr_consultant_date__c=startDate;
                upd2.sr_consultant_end__c=endString;
                var upd2_results=NSOA.wsapi.modify(attr,[upd2]);
                if(upd2_results[0].status!="U") {
                    NSOA.meta.log("error","ERR: Upd2: "+upd2_results[0].errors[0].code);
                }
            }

            if(srConsultantHours>0) {
                var srConsultantBooking = new NSOA.record.oaBooking();
                srConsultantBooking.userid = 9;
                srConsultantBooking.customerid = projectResults[0].objects[i].customerid;
                srConsultantBooking.hours = srConsultantHours;
                srConsultantBooking.booking_typeid = 4;
                srConsultantBooking.projectid = projId;
                srConsultantBooking.as_percentage = "";
                srConsultantBooking.startdate = startDate;
                srConsultantBooking.enddate = endString;
                var add2 = NSOA.wsapi.add([srConsultantBooking]);

                if (add2[0].status!="A") {
                    NSOA.meta.log("info",add2[0].errors[0].code);
                }
                else {
                    NSOA.meta.log("info", "Add 2 Successful");
                }
            }

            if (projectResults[0].objects[i].consultant_date__c !== "0000-00-00") { // 00-00-0000
                startDate = projectResults[0].objects[i].consultant_date__c;
            }
            else {
                var upd3=new NSOA.record.oaProject();
                upd3.id=projId;
                upd3.consultant_date__c=startDate;
                upd3.consultant_end__c=endString;
                var upd3_results=NSOA.wsapi.modify(attr,[upd3]);
                if(upd3_results[0].status!="U") {
                    NSOA.meta.log("error","ERR: upd3: "+upd3_results[0].errors[0].code);
                }
            }

            var consultantBooking = new NSOA.record.oaBooking();
            consultantBooking.userid = 10;
            consultantBooking.customerid = projectResults[0].objects[i].customerid;
            consultantBooking.hours = consultantHours;
            consultantBooking.booking_typeid = 4;
            consultantBooking.projectid = projId;
            consultantBooking.as_percentage = "";
            consultantBooking.startdate = startDate;
            consultantBooking.enddate = endString;
            var add3 = NSOA.wsapi.add([consultantBooking]);

            if (add3[0].status!="A") {
                NSOA.meta.log("info",add3[0].errors[0].code);
            }
            else {
                NSOA.meta.log("info", "Add 3 Successful");
            }

            if (projectResults[0].objects[i].sr_analyst_date__c !== "0000-00-00") { // 00-00-0000
                startDate = projectResults[0].objects[i].sr_analyst_date__c;
            }
            else {
                var upd4=new NSOA.record.oaProject();
                upd4.id=projId;
                upd4.sr_analyst_date__c=startDate;
                upd4.sr_analyst_end__c=endString;
                var upd4_results=NSOA.wsapi.modify(attr,[upd4]);
                if(upd4_results[0].status!="U") {
                    NSOA.meta.log("error","ERR: Upd4: "+upd4_results[0].errors[0].code);
                }
            }

            var srAnalystBooking = new NSOA.record.oaBooking();
            srAnalystBooking.userid = 11;
            srAnalystBooking.customerid = projectResults[0].objects[i].customerid;
            srAnalystBooking.hours = srAnalystHours;
            srAnalystBooking.booking_typeid = 4;
            srAnalystBooking.projectid = projId;
            srAnalystBooking.as_percentage = "";
            srAnalystBooking.startdate = startDate;
            srAnalystBooking.enddate = endString;
            var add4 = NSOA.wsapi.add([srAnalystBooking]);

            if (add4[0].status!="A") {
                NSOA.meta.log("info",add4[0].errors[0].code);
            }
            else {
                NSOA.meta.log("info", "Add 4 Successful");
            }

            if (projectResults[0].objects[i].analyst_date__c !== "0000-00-00") { // 00-00-0000
                startDate = projectResults[0].objects[i].analyst_date__c;
            }
            else {
                var upd5=new NSOA.record.oaProject();
                upd5.id=projId;
                upd5.analyst_date__c=startDate;
                upd5.analyst_end__c=endString;
                var upd5_results=NSOA.wsapi.modify(attr,[upd5]);
                if(upd5_results[0].status!="U") {
                    NSOA.meta.log("error","ERR: Upd5: "+upd5_results[0].errors[0].code);
                }
            }

            var analystBooking = new NSOA.record.oaBooking();
            analystBooking.userid = 11;
            analystBooking.customerid =projectResults[0].objects[i].customerid;
            analystBooking.hours = analystHours;
            analystBooking.booking_typeid = 4;
            analystBooking.projectid = projId;
            analystBooking.as_percentage = "";
            analystBooking.startdate = startDate;
            analystBooking.enddate = endString;
            var add5 = NSOA.wsapi.add([analystBooking]);

            if (add5[0].status!="A") {
                NSOA.meta.log("info",add5[0].errors[0].code);
            }
            else {
                NSOA.meta.log("info", "Add 5 Successful");
            }
        }
        //else {
        //    NSOA.meta.log("info", "Booking Creation Has Been Processed");
        //}
        //}

    }
}

function dateToOADate(dateObj,days) {

    dateObj.setTime(dateObj.getTime()-(days*24*60*60*1000));

    var newOADate=new NSOA.record.oaDate();

    newOADate.year=dateObj.getFullYear();
    newOADate.month=dateObj.getMonth()+1;
    newOADate.day=dateObj.getDate();

    return newOADate;

}

function getDateString(dateObj,formatString) {
    var objYear=dateObj.getFullYear();
    var objMonth=dateObj.getMonth()+1;
    var objDay=dateObj.getDate();

    var objYearString=objYear;
    var objMonthString;
    var objDayString;

    if(objMonth>=10) {
        objMonthString=objMonth;
    }
    else {
        objMonthString="0"+objMonth;
    }

    if(objDay>=10) {
        objDayString=objDay;
    }
    else {
        objDayString="0"+objDay;
    }

    var dateString=formatString;
    dateString=dateString.replace("yyyy",objYearString);
    dateString=dateString.replace("MM",objMonthString);
    dateString=dateString.replace("dd",objDayString);

    return dateString;
}