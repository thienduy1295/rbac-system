// Serialized types — dùng khi truyền qua Server/Client boundary
// _id là string thay vì ObjectId sau khi serialize()

export type SerializedPermission = {
  _id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
};

// Reference type — dùng khi chỉ cần _id + name (vd: group ref trong user, parent group ref)
export type SerializedGroupRef = {
  _id: string;
  name: string;
};

export type SerializedGroup = {
  _id: string;
  name: string;
  description?: string;
  permissions: SerializedPermission[];
  // Sau populate + serialize luôn là object, không bao giờ là string
  parentGroup?: SerializedGroupRef;
  createdBy: { _id: string; name: string; email: string };
  updatedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
};

export type SerializedUser = {
  _id: string;
  name: string;
  email: string;
  role: SerializedRole;
  // Chỉ cần _id + name khi hiển thị groups của user
  groups: SerializedGroupRef[];
  createdAt: string;
  updatedAt: string;
};

export type SerializedRole = {
  _id: string;
  name: string;
  description?: string;
  hierarchy: number;
};

export type SerializedDepartment = {
  _id: string;
  name: string;
  description?: string;
  parentDepartment?: { _id: string; name: string } | string;
  manager?: { _id: string; name: string; email: string };
  linkedGroup?: { _id: string; name: string };
  createdBy: { _id: string; name: string; email: string };
  updatedBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
};
