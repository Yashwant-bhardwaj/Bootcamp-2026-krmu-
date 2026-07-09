import { useEffect, useState } from "react";
import { supabase } from "./supabase";

function App() {
  const [complaints, setComplaints] = useState([]);

  // Input States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Add Complaint
  async function addComplaint() {
    if (title.trim() === "" || description.trim() === "") {
      alert("Please enter Title and Description");
      return;
    }

    const { error } = await supabase
      .from("complaints")
      .insert([
        {
          title,
          description,
          status: "Pending",
        },
      ]);

    if (error) {
      alert(error.message);
    } else {
      alert("Complaint Added Successfully");
      setTitle("");
      setDescription("");
      getComplaints();
    }
  }

  // Fetch Complaints
  async function getComplaints() {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setComplaints(data);
    }
  }

  // Delete Complaint
  async function deleteComplaint(id) {
    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("Complaint Deleted Successfully");
      getComplaints();
    }
  }

  // Update Status
  async function markResolved(id) {
    const { error } = await supabase
      .from("complaints")
      .update({ status: "Resolved" })
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      alert("Complaint Resolved");
      getComplaints();
    }
  }

  useEffect(() => {
    getComplaints();
  }, []);

  return (
    <div
      style={{
        width: "600px",
        margin: "40px auto",
        fontFamily: "Arial",
      }}
    >
      <h1>🎓 Student Complaint Portal</h1>

      <input
        type="text"
        placeholder="Enter Complaint Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
        }}
      />

      <textarea
        placeholder="Enter Complaint Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
        }}
      />

      <br />
      <br />

      <button onClick={addComplaint}>
        Add Complaint
      </button>

      <button
        onClick={getComplaints}
        style={{ marginLeft: "10px" }}
      >
        Refresh
      </button>

      <hr />

      {complaints.length === 0 ? (
        <p>No Complaints Found</p>
      ) : (
        complaints.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginTop: "15px",
            }}
          >
            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    item.status === "Resolved"
                      ? "green"
                      : "orange",
                  fontWeight: "bold",
                }}
              >
                {item.status}
              </span>
            </p>

            <button onClick={() => markResolved(item.id)}>
              Mark Resolved
            </button>

            <button
              onClick={() => deleteComplaint(item.id)}
              style={{ marginLeft: "10px" }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;