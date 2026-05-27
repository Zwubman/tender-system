import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// auth context
import { useAuth } from "../../../context/AuthContext";

// tender service
import tenderService from "../tenderService";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";

export default function BOQPage() {
  // get tender id
  const { tenderId } = useParams();
  console.log("BOQPage Tender ID:", tenderId);
  const navigate = useNavigate();

  // auth
  const { user, loading } = useAuth();

  const loggedInUserToken = !loading ? user?.token : null;

  // boq items
  const [boqItems, setBoqItems] = useState([
    {
      item_no: 1,
      description: "",
      unit: "",
      quantity: "",
    },
  ]);

  // loading
  const [dataLoading, setDataLoading] = useState(false);

  // error message
  const [message, setMessage] = useState("");

  // boq submission status
  const [boqSubmitted, setBoqSubmitted] = useState(false);

  // =========================
  // handle input change
  // =========================

  const handleChange = (index, e) => {
    const updatedItems = [...boqItems];

    updatedItems[index][e.target.name] = e.target.value;

    setBoqItems(updatedItems);
  };

  // =========================
  // add row
  // =========================

  const addRow = () => {
    setBoqItems([
      ...boqItems,

      {
        item_no: boqItems.length + 1,
        description: "",
        unit: "",
        quantity: "",
      },
    ]);
  };

  // =========================
  // remove row
  // =========================

  const removeRow = (index) => {
    const updatedItems = boqItems.filter((_, i) => i !== index);

    // re-number item numbers
    const renumberedItems = updatedItems.map((item, idx) => ({
      ...item,

      item_no: idx + 1,
    }));

    setBoqItems(renumberedItems);
  };

  // =========================
  // submit boq
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setDataLoading(true);

    setMessage("");
    try {
      const res = await tenderService.addBOQItems(
        tenderId,
        boqItems,
        loggedInUserToken,
      );

      const data = await res.json();

      // success
      if (res.ok) {
        setBoqSubmitted(true);

        setMessage(data.message || "BOQ added successfully");
      } else {
        setMessage(data.message || "Failed to add BOQ");
      }
    } catch (error) {
      console.error(error);

      setMessage("Server error");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // publish tender
  // =========================

  const handlePublishTender = async () => {
    try {
      setDataLoading(true);

      const res = await tenderService.publishTender(
        tenderId,
        loggedInUserToken,
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Tender published successfully");

        setTimeout(() => {
          navigate("/my-tenders");
        }, 1500);
      } else {
        setMessage(data.message || "Failed to publish tender");
      }
    } catch (error) {
      console.error(error);

      setMessage("Server error");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={11}>
          <Card className="shadow-lg p-4">
            <h3 className="text-center mb-4">Structured BOQ</h3>

            {/* message */}

            {message && <Alert variant="info">{message}</Alert>}

            {/* ========================= */}
            {/* SHOW FORM */}
            {/* ========================= */}

            {!boqSubmitted ? (
              <Form onSubmit={handleSubmit}>
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>

                      <th>Description</th>

                      <th>Unit</th>

                      <th>Quantity</th>

                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {boqItems.map((item, index) => (
                      <tr key={index}>
                        {/* item number */}

                        <td>{item.item_no}</td>

                        {/* description */}

                        <td>
                          <Form.Control
                            type="text"
                            name="description"
                            value={item.description}
                            onChange={(e) => handleChange(index, e)}
                            required
                          />
                        </td>

                        {/* unit */}

                        <td>
                          <Form.Control
                            type="text"
                            name="unit"
                            value={item.unit}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="m², m³, kg..."
                            required
                          />
                        </td>

                        {/* quantity */}

                        <td>
                          <Form.Control
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleChange(index, e)}
                            required
                          />
                        </td>

                        {/* remove */}

                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => removeRow(index)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* add row */}

                <Button variant="secondary" className="mb-4" onClick={addRow}>
                  + Add BOQ Item
                </Button>

                {/* submit */}

                <Button type="submit" className="w-100" disabled={dataLoading}>
                  {dataLoading ? <Spinner size="sm" /> : "Submit BOQ"}
                </Button>
              </Form>
            ) : (
              // =========================
              // SUCCESS CARD
              // =========================

              <Card className="border-0 bg-light text-center p-5">
                <h3 className="mb-3">BOQ Added Successfully</h3>

                <p className="text-muted">
                  Your tender is now ready to be published.
                </p>

                <Button
                  variant="success"
                  size="lg"
                  onClick={handlePublishTender}
                  disabled={dataLoading}
                >
                  {dataLoading ? <Spinner size="sm" /> : "Publish Tender"}
                </Button>
              </Card>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
