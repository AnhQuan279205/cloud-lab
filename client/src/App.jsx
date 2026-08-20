import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    studentId: "",
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Sinh viên đang được sửa
  const [editingId, setEditingId] = useState(null);

  // Câu 59 + Câu 63: Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students");

      if (!response.ok) {
        throw new Error("Không thể lấy danh sách sinh viên");
      }

      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Không thể kết nối Backend API");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Câu 60 + Câu 61: Thêm hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.studentId || !form.name || !form.email) {
      setMessage("⚠️ Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // =========================
      // CÂU 61: CẬP NHẬT
      // =========================
      if (editingId) {
        const response = await fetch(`/api/students/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể cập nhật sinh viên");
        }

        setMessage("✅ Cập nhật sinh viên thành công!");

        // Thoát chế độ sửa
        setEditingId(null);
      }

      // =========================
      // CÂU 60: THÊM
      // =========================
      else {
        const response = await fetch("/api/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Không thể thêm sinh viên");
        }

        setMessage("✅ Thêm sinh viên thành công!");
      }

      // Xóa dữ liệu form
      setForm({
        studentId: "",
        name: "",
        email: "",
      });

      // Câu 63: Gọi lại API GET
      await fetchStudents();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bắt đầu sửa sinh viên
  const handleEdit = (student) => {
    setEditingId(student._id);

    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    });

    setMessage("✏️ Đang chỉnh sửa sinh viên...");
  };

  // Hủy sửa
  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      studentId: "",
      name: "",
      email: "",
    });

    setMessage("");
  };

  // =========================
  // CÂU 62: XÓA SINH VIÊN
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sinh viên này không?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Không thể xóa sinh viên");
      }

      setMessage("✅ Xóa sinh viên thành công!");

      // Nếu đang sửa sinh viên vừa bị xóa
      if (editingId === id) {
        setEditingId(null);

        setForm({
          studentId: "",
          name: "",
          email: "",
        });
      }

      // Câu 63: Gọi lại API GET
      await fetchStudents();
    } catch (error) {
      console.error(error);
      setMessage("❌ " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Quản lý sinh viên</h1>

      {/* =========================
          FORM THÊM / SỬA
      ========================= */}
      <div className="form-box">
        <h2>{editingId ? "Cập nhật sinh viên" : "Thêm sinh viên"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="studentId"
            placeholder="MSSV"
            value={form.studentId}
            onChange={handleChange}
          />

          <input
            type="text"
            name="name"
            placeholder="Họ tên"
            value={form.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="form-buttons">
            <button type="submit" disabled={loading}>
              {loading
                ? "Đang xử lý..."
                : editingId
                ? "Cập nhật sinh viên"
                : "Thêm sinh viên"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Hủy sửa
              </button>
            )}
          </div>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      {/* =========================
          DANH SÁCH SINH VIÊN
      ========================= */}
      <div className="students-box">
        <h2>Danh sách sinh viên</h2>

        {students.length === 0 ? (
          <p>Chưa có sinh viên.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>

                  <td className="action-buttons">
                    {/* CÂU 61 */}
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(student)}
                      disabled={loading}
                    >
                      Sửa
                    </button>

                    {/* CÂU 62 */}
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(student._id)}
                      disabled={loading}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;