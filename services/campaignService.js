const { connection: db } = require("../config/db");

exports.createCampaign = ({
  name,
  channel,
  status = "Draft",
  startDate,
  repeat = false,
  audienceListId = null,
  recipients = {},
  templateId = null,
  repeatConfig = null,
}) => {
  return new Promise((resolve, reject) => {
    const now = new Date();

    const recipientsToJSON = JSON.stringify(recipients.to || []);
    const recipientsCcJSON = JSON.stringify(recipients.cc || []);
    const recipientsBccJSON = JSON.stringify(recipients.bcc || []);

    let repeatFrequency = null,
      repeatEndType = null,
      repeatEndDate = null;

    if (repeat && repeatConfig) {
      repeatFrequency = repeatConfig.frequency || "Day";
      repeatEndType = repeatConfig.endsOn || "never";
      repeatEndDate = repeatConfig.endDate || null;
    }

    const sql = `
      INSERT INTO campaign 
        (name, channel, status, startDate, \`repeat\`, createdDate, modifiedDate,
         audienceListId, recipientsTo, recipientsCc, recipientsBcc, templateId,
         repeatFrequency, repeatEndType, repeatEndDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        name,
        channel,
        status,
        startDate,
        repeat ? 1 : 0,
        now,
        now,
        audienceListId,
        recipientsToJSON,
        recipientsCcJSON,
        recipientsBccJSON,
        templateId,
        repeatFrequency,
        repeatEndType,
        repeatEndDate,
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          name,
          channel,
          status,
          startDate,
          repeat,
          audienceListId,
          recipients,
          templateId,
          repeatConfig,
          createdDate: now,
          modifiedDate: now,
        });
      }
    );
  });
};

exports.getCampaigns = ({ page = 1, limit = 10, name = "" }) => {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * limit;
    const likeName = `%${name}%`;
    const sql = `
      SELECT SQL_CALC_FOUND_ROWS
        id, name, channel, status, startDate, \`repeat\`,
        audienceListId, recipientsTo, recipientsCc, recipientsBcc,
        templateId, repeatFrequency, repeatEndType, repeatEndDate,
        createdDate, modifiedDate
      FROM campaign
      WHERE isDeleted = 0 AND name LIKE ?
      ORDER BY createdDate DESC
      LIMIT ? OFFSET ?`;

    db.query(sql, [likeName, limit, offset], (err, rows) => {
      if (err) return reject(err);

      db.query("SELECT FOUND_ROWS() as total", (e, totalRows) => {
        if (e) return reject(e);
        resolve([rows, totalRows[0].total]);
      });
    });
  });
};

exports.getCampaignById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT 
      id, name, channel, status, startDate, \`repeat\`,
      audienceListId, recipientsTo, recipientsCc, recipientsBcc,
      templateId, repeatFrequency, repeatEndType, repeatEndDate,
      createdDate, modifiedDate
    FROM campaign
    WHERE id = ? AND isDeleted = 0`;

    db.query(sql, [id], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error("Campaign not found"));
      resolve(rows[0]);
    });
  });
};

exports.updateCampaign = (id, data) => {
  return new Promise((resolve, reject) => {
    const now = new Date();

    const updateFields = [];
    const params = [];

    if ("name" in data) {
      updateFields.push("name = ?");
      params.push(data.name);
    }
    if ("channel" in data) {
      updateFields.push("channel = ?");
      params.push(data.channel);
    }
    if ("status" in data) {
      updateFields.push("status = ?");
      params.push(data.status);
    }
    if ("startDate" in data) {
      updateFields.push("startDate = ?");
      params.push(data.startDate);
    }
    if ("repeat" in data) {
      updateFields.push("`repeat` = ?");
      params.push(data.repeat ? 1 : 0);
    }
    if ("audienceListId" in data) {
      updateFields.push("audienceListId = ?");
      params.push(data.audienceListId);
    }
    if ("recipients" in data) {
      updateFields.push("recipientsTo = ?", "recipientsCc = ?", "recipientsBcc = ?");
      params.push(
        JSON.stringify(data.recipients.to || []),
        JSON.stringify(data.recipients.cc || []),
        JSON.stringify(data.recipients.bcc || [])
      );
    }
    if ("templateId" in data) {
      updateFields.push("templateId = ?");
      params.push(data.templateId);
    }
    if ("repeatConfig" in data) {
      updateFields.push("repeatFrequency = ?", "repeatEndType = ?", "repeatEndDate = ?");
      params.push(
        data.repeatConfig?.frequency || null,
        data.repeatConfig?.endsOn || null,
        data.repeatConfig?.endDate || null
      );
    }

    if (updateFields.length === 0) {
      return reject(new Error("No update fields provided"));
    }

    updateFields.push("modifiedDate = ?");
    params.push(now);
    params.push(id);

    const sql = `UPDATE campaign SET ${updateFields.join(", ")} WHERE id = ? AND isDeleted = 0`;

    db.query(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

exports.deleteCampaign = (id) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    db.query(
      "UPDATE campaign SET isDeleted = 1, modifiedDate = ? WHERE id = ? AND isDeleted = 0",
      [now, id],
      (err, result) => {
        if (err) return reject(err);
        if (result.affectedRows === 0) return reject(new Error("Campaign not found"));
        resolve();
      }
    );
  });
};

exports.copyCampaign = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM campaign WHERE id = ? AND isDeleted=0", [id], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error("Original campaign not found"));

      const orig = rows[0];
      const newName = orig.name + "_copy";

      const sql = `
        INSERT INTO campaign 
          (name, channel, status, startDate, \`repeat\`, createdDate, modifiedDate,
            audienceListId, recipientsTo, recipientsCc, recipientsBcc, templateId,
            repeatFrequency, repeatEndType, repeatEndDate)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          newName,
          orig.channel,
          orig.status,
          orig.startDate,
          orig.repeat,
          orig.audienceListId,
          orig.recipientsTo,
          orig.recipientsCc,
          orig.recipientsBcc,
          orig.templateId,
          orig.repeatFrequency,
          orig.repeatEndType,
          orig.repeatEndDate,
        ],
        (insertErr, result) => {
          if (insertErr) return reject(insertErr);
          resolve({ id: result.insertId });
        }
      );
    });
  });
};
