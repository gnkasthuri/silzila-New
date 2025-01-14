package org.silzila.app.repository;

import org.springframework.stereotype.Repository;
import org.silzila.app.dto.DBConnectionDTO;
import org.silzila.app.model.DBConnection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DBConnectionRepository extends JpaRepository<DBConnection, String> {

    List<DBConnection> findByUserId(String userId);

    Optional<DBConnection> findById(String id);

    Optional<DBConnection> findByIdAndUserId(String id, String userId);

    List<DBConnection> findByIdNotAndUserIdAndConnectionName(String id, String userId, String connectionName);

    List<DBConnection> findByUserIdAndConnectionName(String userId, String connectionName);

}
