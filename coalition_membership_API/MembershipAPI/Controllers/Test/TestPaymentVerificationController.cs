using Microsoft.AspNetCore.Mvc;
using MembershipInfrustructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Net;
using MembershipInfrustructure.Model.Users;
using MembershipInfrustructure.Model.Donation;

namespace MembershipAPI.Controllers.Test
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class TestPaymentVerificationController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<TestPaymentVerificationController> _logger;

        public TestPaymentVerificationController(
            ApplicationDbContext dbContext,
            ILogger<TestPaymentVerificationController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        /// <summary>
        /// Get count of pending payments for testing
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPendingPaymentsCount()
        {
            try
            {
                var pendingMemberPayments = await _dbContext.MemberPayments
                    .Where(p => p.PaymentStatus == PaymentStatus.PENDING)
                    .Where(p => p.CreatedDate >= DateTime.Now.AddHours(-24))
                    .CountAsync();

                var pendingDonationPayments = await _dbContext.DonationEventDetails
                    .Where(p => !p.IsPaid)
                    .Where(p => p.CreatedDate >= DateTime.Now.AddHours(-24))
                    .CountAsync();

                return Ok(new
                {
                    PendingMemberPayments = pendingMemberPayments,
                    PendingDonationPayments = pendingDonationPayments,
                    TotalPending = pendingMemberPayments + pendingDonationPayments,
                    LastChecked = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending payments count");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get details of pending payments for testing
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPendingPaymentsDetails()
        {
            try
            {
                var pendingMemberPayments = await _dbContext.MemberPayments
                    .Where(p => p.PaymentStatus == PaymentStatus.PENDING)
                    .Where(p => p.CreatedDate >= DateTime.Now.AddHours(-24))
                    .Select(p => new
                    {
                        p.TransactionReference,
                        p.Amount,
                        p.CreatedDate,
                        p.MemberId
                    })
                    .ToListAsync();

                var pendingDonationPayments = await _dbContext.DonationEventDetails
                    .Where(p => !p.IsPaid)
                    .Where(p => p.CreatedDate >= DateTime.Now.AddHours(-24))
                    .Select(p => new
                    {
                        p.TransactionReference,
                        p.Amount,
                        p.CreatedDate,
                        p.PhoneNumber
                    })
                    .ToListAsync();

                return Ok(new
                {
                    MemberPayments = pendingMemberPayments,
                    DonationPayments = pendingDonationPayments
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting pending payments details");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Create a test pending payment for testing
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateTestPayment()
        {
            try
            {
                // Get a random member
                var member = await _dbContext.Members
                    .OrderBy(m => Guid.NewGuid())
                    .FirstOrDefaultAsync();

                if (member == null)
                {
                    return BadRequest("No members found in database");
                }

                // Get a membership type
                var membershipType = await _dbContext.MembershipTypes
                    .FirstOrDefaultAsync();

                if (membershipType == null)
                {
                    return BadRequest("No membership types found in database");
                }

                // Create test payment
                var testPayment = new MemberPayment
                {
                    Id = Guid.NewGuid(),
                    MemberId = member.Id,
                    PaymentUrl = "https://test-payment-url.com",
                    MembershipTypeId = membershipType.Id,
                    ExpiryDate = DateTime.Now.AddDays(365),
                    LastPaidDate = DateTime.Now,
                    TransactionReference = "TEST-TXN-" + Guid.NewGuid().ToString("N")[..8],
                    Amount = 100.00,
                    PaymentStatus = PaymentStatus.PENDING,
                    CreatedDate = DateTime.Now
                };

                _dbContext.MemberPayments.Add(testPayment);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Test payment created successfully",
                    TransactionReference = testPayment.TransactionReference,
                    MemberId = member.Id,
                    MemberName = member.FullName
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating test payment");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
