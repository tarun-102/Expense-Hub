import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  Spinner,
  Table,
} from "react-bootstrap";

import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from "react-icons/fi";

import { useAppDispatch, useAppSelector } from "../app/hooks";

import ReusableFormModal, {
  type FormField,
} from "../components/common/ReusableFormModal";
import Modal from "../components/common/Modal";

import {
  getAllPartiesThunk,
  createPartyThunk,
  updatePartyThunk,
  deletePartyThunk,
  setSelectedParty,
  clearSelectedParty,
  clearPartyError,
} from "../features/party/partySlice";

import { toast } from "react-toastify";
import { addActivityNotification } from "../utils/notificationHelper";

import type {
  Party,
  PartyPayload,
} from "../features/party/partyTypes";
import {
  PARTY_TYPE_OPTIONS,
  formatPartyType,
} from "../features/party/partyTypes";

const initialForm: PartyPayload = {
  party_type: "person",
  party_name: "",
  title: "",
};

const partyFields: FormField[] = [
  {
    name: "party_name",
    label: "Party Name",
    type: "text",
    placeholder: "Enter party name",
    required: true,
    colSpan: 6,
  },
  {
    name: "party_type",
    label: "Party Type",
    type: "select",
    required: true,
    options: PARTY_TYPE_OPTIONS,
    colSpan: 6,
  },
  {
    name: "title",
    label: "Title / Description",
    type: "text",
    placeholder: "Enter title or description",
    required: true,
    colSpan: 12,
  },
];

const PartyPage = () => {
  const dispatch = useAppDispatch();

  const { parties, selectedParty, loading, error } = useAppSelector(
    (state) => state.party,
  );

  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formData, setFormData] = useState<PartyPayload>(initialForm);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    dispatch(getAllPartiesThunk());
  }, [dispatch]);

  const filteredParties = useMemo(() => {
    return parties.filter((party) => {
      const matchesSearch =
        party.party_name.toLowerCase().includes(search.toLowerCase()) ||
        party.title.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" || party.party_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [parties, search, typeFilter]);

  const handleOpenAdd = () => {
    dispatch(clearSelectedParty());
    dispatch(clearPartyError());
    dispatch(getAllPartiesThunk());

    setFormData(initialForm);
    setShowModal(true);
  };

  const handleEdit = (party: Party) => {
    dispatch(setSelectedParty(party));
    dispatch(clearPartyError());

    setFormData({
      party_type: party.party_type,
      party_name: party.party_name,
      title: party.title,
    });

    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);

    dispatch(clearSelectedParty());
    dispatch(clearPartyError());

    setFormData(initialForm);
  };

  const handleChange = (name: string, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (selectedParty) {
        await dispatch(
          updatePartyThunk({
            id: selectedParty._id,
            data: formData,
          }),
        ).unwrap();
        toast.success("Party updated successfully!");
      } else {
        await dispatch(createPartyThunk(formData)).unwrap();
        toast.success("Party added successfully!");

        addActivityNotification({
          title: "New Party Added",
          message: `Party "${formData.party_name}" (${formData.party_type}) created.`,
          type: "party",
          link: "/parties",
        });
      }

      handleClose();
    } catch {
      // handled by reducer
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    dispatch(clearPartyError());

    try {
      await dispatch(deletePartyThunk(deleteId)).unwrap();
      toast.success("Party deleted successfully!");
      setDeleteId(null);
    } catch {
      // handled by reducer
    }
  };

  return (
    <div className="party-page">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Party Master</h3>
          <p className="text-muted mb-0">
            Manage your companies, banks, people and stores.
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <FiPlus className="me-2" />
          Add Party
        </Button>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <h5 className="fw-semibold mb-0">All Parties ({parties.length})</h5>

            <div className="d-flex flex-wrap gap-2">
              <InputGroup style={{ maxWidth: "250px" }}>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>

                <Form.Control
                  placeholder="Search party..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </InputGroup>

              <Form.Select
                style={{ width: "190px" }}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="all">All Types</option>
                {PARTY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading && parties.length === 0 ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="d-none d-md-block">
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Party Name</th>
                      <th>Title</th>
                      <th>Party Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParties.length > 0 ? (
                      filteredParties.map((party, index) => (
                        <tr key={party._id}>
                          <td>{index + 1}</td>

                          <td className="fw-semibold">{party.party_name}</td>

                          <td>{party.title}</td>

                          <td>
                            <Badge bg="light" text="dark">
                              {formatPartyType(party.party_type)}
                            </Badge>
                          </td>

                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleEdit(party)}
                              disabled={loading}
                            >
                              <FiEdit2 />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(party._id)}
                              disabled={loading}
                            >
                              <FiTrash2 />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          No parties found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="d-md-none mobile-card-list">
                {filteredParties.length > 0 ? (
                  filteredParties.map((party) => (
                    <div key={party._id} className="mobile-data-card">
                      <div className="mobile-card-header">
                        <div>
                          <div className="mobile-card-title">{party.party_name}</div>
                          {party.title && (
                            <div className="text-muted small mt-1">{party.title}</div>
                          )}
                        </div>
                        <Badge bg="light" text="dark" className="border">
                          {formatPartyType(party.party_type)}
                        </Badge>
                      </div>

                      <div className="mobile-card-actions">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="px-3 py-1 d-inline-flex align-items-center gap-1"
                          onClick={() => handleEdit(party)}
                          disabled={loading}
                        >
                          <FiEdit2 size={13} /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="px-3 py-1 d-inline-flex align-items-center gap-1"
                          onClick={() => handleDelete(party._id)}
                          disabled={loading}
                        >
                          <FiTrash2 size={13} /> Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-5">
                    No parties found.
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <ReusableFormModal
        show={showModal}
        title={selectedParty ? "Edit Party" : "Add Party"}
        fields={partyFields}
        values={formData}
        loading={loading}
        error={error}
        submitText={selectedParty ? "Update Party" : "Create Party"}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={handleClose}
      />

      <Modal
        show={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Party"
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        loading={loading}
      >
        Are you sure you want to delete this party? This action cannot be undone.
      </Modal>
    </div>
  );
};

export default PartyPage;
