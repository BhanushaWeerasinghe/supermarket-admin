import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Suppliers = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/suppliers"
      );

      setSuppliers(response.data.suppliers);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/suppliers/${id}`
      );

      alert("Supplier deleted successfully!");

      fetchSuppliers();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to delete supplier"
      );
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-600">
          Loading suppliers...
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Suppliers
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your suppliers
          </p>
        </div>

        <button
          onClick={() => navigate("/suppliers/add")}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
        >
          + Add Supplier
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4">
                Name
              </th>

              <th className="text-left px-6 py-4">
                Company
              </th>

              <th className="text-left px-6 py-4">
                Phone
              </th>

              <th className="text-left px-6 py-4">
                Email
              </th>

              <th className="text-left px-6 py-4">
                Address
              </th>

              <th className="text-left px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-10 text-gray-500"
                >
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium">
                    {supplier.name}
                  </td>

                  <td className="px-6 py-4">
                    {supplier.company || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {supplier.phone}
                  </td>

                  <td className="px-6 py-4">
                    {supplier.email || "-"}
                  </td>

                  <td className="px-6 py-4">
                    {supplier.address || "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/suppliers/edit/${supplier.id}`
                          )
                        }
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(supplier.id)
                        }
                        className="px-3 py-1 bg-red-100 text-red-700 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total Suppliers: {suppliers.length}
      </div>
    </div>
  );
};

export default Suppliers;