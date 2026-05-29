import { apiFetch } from "../../../../services/api";

const getAuditLogs = async (token, page = 1, limit = 10) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch(`/audit-logs?page=${page}&limit=${limit}`, requestOptions);
};

const auditLogService = {
  getAuditLogs,
};

export default auditLogService;
