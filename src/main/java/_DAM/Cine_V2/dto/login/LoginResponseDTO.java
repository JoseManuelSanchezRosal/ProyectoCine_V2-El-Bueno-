package _DAM.Cine_V2.dto.login;

public record LoginResponseDTO(
  String email,
  String message,
  String token
) {}