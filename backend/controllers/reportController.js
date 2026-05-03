const puppeteer = require("puppeteer");
const User = require("../models/User");
const LeaveRequest = require("../models/LeaveRequest");
const LoanRequest = require("../models/LoanRequest");
const Task = require("../models/Task");

const generateEmployeeReport = async (req, res, next) => {
  try {
    const employee = await User.findById(req.user._id).populate(
      "department",
      "name",
    );

    const leaves = await LeaveRequest.find({ employee: req.user._id }).sort({
      createdAt: -1,
    });

    const loans = await LoanRequest.find({ employee: req.user._id }).sort({
      createdAt: -1,
    });

    const totalTasks = await Task.countDocuments({ assignedTo: req.user._id });
    const doneTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "done",
    });
    const pendingTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "pending",
    });
    const inProgressTasks = await Task.countDocuments({
      assignedTo: req.user._id,
      status: "in-progress",
    });

    const usedLeaveDays = leaves
      .filter((l) => l.status === "approved")
      .reduce((acc, l) => acc + l.numberOfDays, 0);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #333; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 15px; }
          .header h1 { font-size: 24px; }
          .header p { font-size: 14px; margin-top: 5px; opacity: 0.8; }
          .section { margin-bottom: 15px; }
          .section-title { font-size: 18px; font-weight: bold; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { background: #f8fafc; padding: 8px; border-radius: 6px; }
          .info-item .label { font-size: 12px; color: #888; margin-bottom: 4px; }
          .info-item .value { font-size: 14px; font-weight: bold; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; }
          .stat-box { background: #f8fafc; padding: 10px; border-radius: 6px; text-align: center; }
          .stat-box .number { font-size: 22px; font-weight: bold; color: #1e40af; }
          .stat-box .label { font-size: 12px; color: #888; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; }
          table th { background: #1e40af; color: white; padding: 7px 10px; text-align: left; font-size: 12px; }
          table td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
          table tr:nth-child(even) { background: #f8fafc; }
          .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
          .badge-approved { background: #dcfce7; color: #16a34a; }
          .badge-rejected { background: #fee2e2; color: #dc2626; }
          .badge-pending { background: #fef3c7; color: #d97706; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Employee Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Full Name</div>
              <div class="value">${employee.fullName}</div>
            </div>
            <div class="info-item">
              <div class="label">Email</div>
              <div class="value">${employee.email}</div>
            </div>
            <div class="info-item">
              <div class="label">Department</div>
              <div class="value">${employee.department ? employee.department.name : "Not Assigned"}</div>
            </div>
            <div class="info-item">
              <div class="label">Join Date</div>
              <div class="value">${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Nationality</div>
              <div class="value">${employee.nationality || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Phone</div>
              <div class="value">${employee.phone || "N/A"}</div>
              </div>
            <div class="info-item">
              <div class="label">Contract Duration</div>
              <div class="value">${employee.contractDuration || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Years of Experience</div>
              <div class="value">${employee.yearsOfExperience ?? "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Salary</div>
              <div class="value">${employee.salary ? "$" + employee.salary : "N/A"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Task Statistics</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="number">${totalTasks}</div>
              <div class="label">Total Tasks</div>
            </div>
            <div class="stat-box">
              <div class="number">${doneTasks}</div>
              <div class="label">Completed</div>
            </div>
            <div class="stat-box">
              <div class="number">${inProgressTasks}</div>
              <div class="label">In Progress</div>
            </div>
            <div class="stat-box">
              <div class="number">${pendingTasks}</div>
              <div class="label">Pending</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Leave History</div>
          <div class="info-grid" style="margin-bottom: 15px;">
            <div class="info-item">
              <div class="label">Remaining Balance</div>
              <div class="value">${employee.annualLeaveBalance} days</div>
            </div>
            <div class="info-item">
              <div class="label">Used Days</div>
              <div class="value">${usedLeaveDays} days</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                leaves.length === 0
                  ? `<tr><td colspan="5" style="text-align:center;">No leave requests</td></tr>`
                  : leaves
                      .map(
                        (l) => `
              <tr>
                <td>${new Date(l.startDate).toLocaleDateString()}</td>
                <td>${new Date(l.endDate).toLocaleDateString()}</td>
                <td>${l.numberOfDays}</td>
                <td>${l.reason || "N/A"}</td>
                <td><span class="badge badge-${l.status}">${l.status}</span></td>
              </tr>`,
                      )
                      .join("")
              }
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Loan History</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                loans.length === 0
                  ? `<tr><td colspan="4" style="text-align:center;">No loan requests</td></tr>`
                  : loans
                      .map(
                        (l) => `
              <tr>
                <td>${new Date(l.createdAt).toLocaleDateString()}</td>
                <td>$${l.amount}</td>
                <td>${l.reason || "N/A"}</td>
                <td><span class="badge badge-${l.status}">${l.status}</span></td>
              </tr>`,
                      )
                      .join("")
              }
            </tbody>
          </table>
        </div>

        <div class="footer" style="margin-top: 20px;">
          <p>This report was automatically generated by the Employee Management System</p>
        </div>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10px", bottom: "10px", left: "15px", right: "15px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${employee.fullName.replace(" ", "-")}.pdf`,
    );
    res.send(pdf);
  } catch (error) {
    next(error);
  }
};

module.exports = { generateEmployeeReport };
