"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from "@mui/material";
import {
  Close,
  PlayArrow,
  Save,
  History,
  Code,
  Storage,
  CheckCircle
} from "@mui/icons-material";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { H6 } from "@/components/Typography";

interface SqlEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onExecute: (query: string) => void;
}

interface QueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTime: number;
}

export default function SqlEditorDialog({
  open,
  onClose,
  onExecute
}: SqlEditorDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample query history
  const queryHistory = [
    "SELECT * FROM orders WHERE status = 'completed' ORDER BY created_at DESC LIMIT 10",
    "UPDATE orders SET status = 'shipped' WHERE id = 'ORD-001'",
    "SELECT customer_name, COUNT(*) as order_count FROM orders GROUP BY customer_name ORDER BY order_count DESC",
    "SELECT * FROM orders WHERE created_at >= DATE('now', '-7 days')"
  ];

  // Sample database schema
  const dbSchema = {
    orders: [
      { name: "id", type: "TEXT", key: "PRIMARY KEY" },
      { name: "customer_name", type: "TEXT", key: "" },
      { name: "customer_email", type: "TEXT", key: "" },
      { name: "customer_phone", type: "TEXT", key: "" },
      { name: "total_amount", type: "REAL", key: "" },
      { name: "status", type: "TEXT", key: "" },
      { name: "payment_status", type: "TEXT", key: "" },
      { name: "items_count", type: "INTEGER", key: "" },
      { name: "created_at", type: "DATETIME", key: "" },
      { name: "updated_at", type: "DATETIME", key: "" }
    ],
    order_items: [
      { name: "id", type: "INTEGER", key: "PRIMARY KEY" },
      { name: "order_id", type: "TEXT", key: "FOREIGN KEY" },
      { name: "product_name", type: "TEXT", key: "" },
      { name: "quantity", type: "INTEGER", key: "" },
      { name: "price", type: "REAL", key: "" }
    ]
  };

  const handleExecute = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);
    setError(null);

    try {
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute actual SQL query
      try {
        // TODO: Replace with actual API call
        const results: QueryResult = {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0
        };
        setResults(results);
      } catch (error) {
        console.error('SQL execution error:', error);
        setResults({
          columns: [],
          rows: [],
          rowCount: 0,
          executionTime: 0
        });
      }

      onExecute(query);
    } catch (err) {
      setError("שגיאה בביצוע השאילתה: " + (err as Error).message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuerySelect = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setActiveTab(0);
  };

  const sampleQueries = [
    {
      title: "הזמנות אחרונות",
      query: "SELECT * FROM orders ORDER BY created_at DESC LIMIT 10",
      description: "מציג 10 ההזמנות האחרונות"
    },
    {
      title: "הזמנות ממתינות",
      query: "SELECT * FROM orders WHERE status = 'pending'",
      description: "כל ההזמנות הממתינות לעיבוד"
    },
    {
      title: "לקוחות מובילים",
      query: "SELECT customer_name, COUNT(*) as orders, SUM(total_amount) as total FROM orders GROUP BY customer_name ORDER BY total DESC",
      description: "לקוחות לפי סכום הזמנות"
    },
    {
      title: "הכנסות השבוע",
      query: "SELECT DATE(created_at) as date, SUM(total_amount) as revenue FROM orders WHERE created_at >= DATE('now', '-7 days') GROUP BY DATE(created_at)",
      description: "הכנסות יומיות בשבוע האחרון"
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: "90vh" }
      }}
    >
      <DialogTitle>
        <FlexBetween>
          <FlexBox alignItems="center" gap={2}>
            <Code color="primary" />
            <Typography variant="h6" fontWeight={700}>
              SQL Editor - עורך מסד הנתונים
            </Typography>
          </FlexBox>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </FlexBetween>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="עורך שאילתות" icon={<Code />} />
            <Tab label="היסטוריה" icon={<History />} />
            <Tab label="מבנה מסד נתונים" icon={<Storage />} />
          </Tabs>
        </Box>

        {/* Query Editor Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>אזהרה:</strong> עורך SQL מאפשר גישה ישירה למסד הנתונים. שימוש זהיר בלבד!
            </Alert>

            {/* Sample Queries */}
            <Box sx={{ mb: 3 }}>
              <H6 sx={{ mb: 2, fontWeight: 700 }}>שאילתות לדוגמה</H6>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 2 }}>
                {sampleQueries.map((sample, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: 2,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "primary.50"
                      }
                    }}
                    onClick={() => handleQuerySelect(sample.query)}
                  >
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      {sample.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {sample.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        color: "primary.main",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {sample.query}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            {/* Query Input */}
            <Box sx={{ mb: 3 }}>
              <FlexBetween mb={2}>
                <H6 sx={{ fontWeight: 700 }}>שאילתת SQL</H6>
                <FlexBox gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    שמור
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={handleExecute}
                    disabled={!query.trim() || isExecuting}
                    sx={{ borderRadius: 2 }}
                  >
                    {isExecuting ? "מבצע..." : "הרץ"}
                  </Button>
                </FlexBox>
              </FlexBetween>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="הכנס שאילתת SQL כאן..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontFamily: "monospace",
                    fontSize: "0.9rem"
                  }
                }}
              />
            </Box>

            {/* Results */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {results && (
              <Box>
                <FlexBetween mb={2}>
                  <H6 sx={{ fontWeight: 700 }}>תוצאות</H6>
                  <FlexBox gap={2}>
                    <Chip
                      icon={<CheckCircle />}
                      label={`${results.rowCount} שורות`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`${results.executionTime}ms`}
                      size="small"
                      variant="outlined"
                    />
                  </FlexBox>
                </FlexBetween>

                {results.rows.length > 0 ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {results.columns.map((column, index) => (
                            <TableCell key={index} sx={{ fontWeight: 700 }}>
                              {column}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.rows.map((row, index) => (
                          <TableRow key={index} hover>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="success">
                    השאילתה בוצעה בהצלחה. {results.rowCount} שורות הושפעו.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Query History Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <H6 sx={{ mb: 3, fontWeight: 700 }}>היסטוריית שאילתות</H6>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {queryHistory.map((historyQuery, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "grey.300",
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "primary.50"
                    }
                  }}
                  onClick={() => handleQuerySelect(historyQuery)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: "text.primary",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {historyQuery}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Database Schema Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <H6 sx={{ mb: 3, fontWeight: 700 }}>מבנה מסד הנתונים</H6>
            {Object.entries(dbSchema).map(([tableName, columns]) => (
              <Box key={tableName} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  📋 {tableName}
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>שם עמודה</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>סוג נתונים</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>מפתח</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {columns.map((column, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                              {column.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={column.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {column.key && (
                              <Chip
                                label={column.key}
                                size="small"
                                color={column.key.includes("PRIMARY") ? "primary" : "secondary"}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          סגור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
