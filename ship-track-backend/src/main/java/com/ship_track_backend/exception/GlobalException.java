package com.ship_track_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.ship_track_backend.payload.ApiResponse;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalException {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(MethodArgumentNotValidException ex) {

		Map<String, String> fieldErrors = new HashMap<>();

		for (FieldError error : ex.getBindingResult().getFieldErrors()) {
			fieldErrors.put(error.getField(), error.getDefaultMessage());
		}

		ApiResponse<Map<String, String>> response = new ApiResponse<>(false, "Enter correct data", fieldErrors);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	// Handles exceptions you throw yourself in services, e.g.:
	// throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already
	// registered");
	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ApiResponse<Object>> handleResponseStatusException(ResponseStatusException ex) {

		ApiResponse<Object> response = new ApiResponse<>(false, ex.getReason(), null);

		return ResponseEntity.status(ex.getStatusCode()).body(response);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> handleException(Exception ex) {

		System.err.println("========== EXCEPTION ==========");
		System.err.println("TYPE: " + ex.getClass().getName());
		System.err.println("MESSAGE: " + ex.getMessage());
		ex.printStackTrace();
		System.err.println("================================");

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
	}

	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex) {

		ApiResponse<Object> response = new ApiResponse<>(false, ex.getMessage(), null);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

}